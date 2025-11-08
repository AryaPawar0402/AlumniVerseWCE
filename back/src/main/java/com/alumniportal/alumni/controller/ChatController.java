package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.ChatMessageDTO;
import com.alumniportal.alumni.entity.ChatMessage;
import com.alumniportal.alumni.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MessageMapping("/sendMessage")
    public void handleChatMessage(@Payload Object payload, Principal principal) {
        log.info("🔥 === WEBSOCKET MESSAGE RECEIVED ===");

        try {
            ChatMessageDTO chatMessageDTO;
            String payloadString;

            // Handle different payload types
            if (payload instanceof byte[]) {
                payloadString = new String((byte[]) payload, StandardCharsets.UTF_8);
            } else if (payload instanceof String) {
                payloadString = (String) payload;
            } else {
                log.error("❌ Unknown payload type: {}", payload.getClass());
                return;
            }

            // Parse JSON to Map
            Map<String, Object> payloadMap = objectMapper.readValue(payloadString, Map.class);

            // Convert to DTO
            chatMessageDTO = new ChatMessageDTO();
            chatMessageDTO.setSenderId(Long.valueOf(payloadMap.get("senderId").toString()));
            chatMessageDTO.setReceiverId(Long.valueOf(payloadMap.get("receiverId").toString()));
            chatMessageDTO.setContent(payloadMap.get("content").toString());

            log.info("📤 Message - From: {} To: {} Content: {}",
                    chatMessageDTO.getSenderId(),
                    chatMessageDTO.getReceiverId(),
                    chatMessageDTO.getContent());

            // Convert to Entity and save
            ChatMessage message = ChatMessage.builder()
                    .senderId(chatMessageDTO.getSenderId())
                    .receiverId(chatMessageDTO.getReceiverId())
                    .content(chatMessageDTO.getContent())
                    .build();

            log.info("💾 Saving message to database...");
            ChatMessage savedMessage = chatService.saveMessage(message);

            // Convert to DTO for sending
            ChatMessageDTO savedDTO = ChatMessageDTO.fromEntity(savedMessage);

            // Send to receiver FIRST for immediate delivery
            String receiverDestination = "/user/" + chatMessageDTO.getReceiverId() + "/queue/messages";
            log.info("📤 Sending to receiver: {}", receiverDestination);

            messagingTemplate.convertAndSendToUser(
                    chatMessageDTO.getReceiverId().toString(),
                    "/queue/messages",
                    savedDTO
            );

            // Send confirmation back to sender SECOND
            String senderDestination = "/user/" + chatMessageDTO.getSenderId() + "/queue/messages";
            log.info("📤 Sending confirmation to sender: {}", senderDestination);

            messagingTemplate.convertAndSendToUser(
                    chatMessageDTO.getSenderId().toString(),
                    "/queue/messages",
                    savedDTO
            );

            log.info("✅ MESSAGE DELIVERED TO BOTH USERS");

            // Mark as delivered after sending (async)
            CompletableFuture.runAsync(() -> {
                try {
                    Thread.sleep(100); // Small delay to ensure message is received
                    chatService.markMessageAsDelivered(savedMessage.getId(), savedMessage.getReceiverId());
                } catch (Exception e) {
                    log.error("❌ Error marking as delivered: {}", e.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("❌ ERROR PROCESSING MESSAGE: {}", e.getMessage(), e);
        }
    }

    // Add new endpoint for message status updates
    @PostMapping("/markDelivered/{messageId}/{receiverId}")
    public ResponseEntity<Map<String, String>> markAsDelivered(
            @PathVariable("messageId") Long messageId,
            @PathVariable("receiverId") Long receiverId) {

        log.info("📬 Marking message {} as delivered to {}", messageId, receiverId);

        try {
            chatService.markMessageAsDelivered(messageId, receiverId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Message marked as delivered");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error marking as delivered: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/conversation/{user1}/{user2}")
    public ResponseEntity<List<ChatMessageDTO>> getConversation(
            @PathVariable("user1") Long user1,
            @PathVariable("user2") Long user2) {

        log.info("📖 REST: Fetching conversation between {} and {}", user1, user2);

        try {
            List<ChatMessage> messages = chatService.getConversation(user1, user2);
            List<ChatMessageDTO> dtos = messages.stream()
                    .map(ChatMessageDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("📚 Found {} messages", dtos.size());
            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("❌ Error fetching conversation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/markAsRead/{senderId}/{receiverId}")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable("senderId") Long senderId,
            @PathVariable("receiverId") Long receiverId) {

        log.info("📖 Marking messages as read from {} to {}", senderId, receiverId);

        try {
            chatService.markMessagesAsRead(senderId, receiverId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Messages marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error marking as read: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/unreadCount/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable("userId") Long userId) {
        log.info("🔔 Getting unread count for user {}", userId);

        try {
            long count = chatService.getUnreadMessageCount(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            log.info("🔔 Unread count: {}", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error getting unread count: {}", e.getMessage(), e);
            Map<String, Long> response = new HashMap<>();
            response.put("count", 0L);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/debug/status")
    public ResponseEntity<Map<String, Object>> getDebugStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            List<ChatMessage> testConversation = chatService.getConversation(15L, 19L);
            status.put("conversation_15_19_count", testConversation.size());
            status.put("databaseStatus", "OK");
            status.put("websocketBroker", "ENABLED");

            log.info("🔍 Debug Status - Messages: {}", testConversation.size());

        } catch (Exception e) {
            status.put("databaseStatus", "ERROR: " + e.getMessage());
            log.error("❌ Debug error: {}", e.getMessage());
        }

        return ResponseEntity.ok(status);
    }

    @PostMapping("/test/send-websocket")
    public ResponseEntity<Map<String, Object>> testWebSocketSend(@RequestBody Map<String, Object> payload) {
        Map<String, Object> result = new HashMap<>();

        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            String content = payload.get("content").toString();

            log.info("🧪 TEST: Sending message {} -> {}: {}", senderId, receiverId, content);

            ChatMessage message = ChatMessage.builder()
                    .senderId(senderId)
                    .receiverId(receiverId)
                    .content(content)
                    .build();

            ChatMessage savedMessage = chatService.saveMessage(message);
            ChatMessageDTO savedDTO = ChatMessageDTO.fromEntity(savedMessage);

            // Send via WebSocket
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/messages",
                    savedDTO
            );

            result.put("success", true);
            result.put("messageId", savedMessage.getId());
            log.info("✅ TEST: Message sent successfully");

        } catch (Exception e) {
            log.error("❌ TEST: Failed - {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}