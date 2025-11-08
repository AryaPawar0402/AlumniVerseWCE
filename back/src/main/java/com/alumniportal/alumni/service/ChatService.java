package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.ChatMessage;
import com.alumniportal.alumni.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        try {
            // Generate conversation ID
            String conversationId = generateConversationId(
                    message.getSenderId(),
                    message.getReceiverId()
            );
            message.setConversationId(conversationId);

            // Set timestamp if not set
            if (message.getTimestamp() == null) {
                message.setTimestamp(LocalDateTime.now());
            }

            // Set default status if not set
            if (message.getStatus() == null) {
                message.setStatus(ChatMessage.MessageStatus.SENT);
            }

            ChatMessage saved = chatMessageRepository.save(message);
            log.info("💾 Message saved: ID={}, From={}, To={}",
                    saved.getId(),
                    saved.getSenderId(),
                    saved.getReceiverId());

            return saved;
        } catch (Exception e) {
            log.error("❌ Error saving message: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getConversation(Long user1, Long user2) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findConversationBetweenUsers(user1, user2);
            log.info("📖 Loaded {} messages between {} and {}", messages.size(), user1, user2);
            return messages;
        } catch (Exception e) {
            log.error("❌ Error loading conversation: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        try {
            List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(senderId, receiverId);

            for (ChatMessage message : unreadMessages) {
                message.setStatus(ChatMessage.MessageStatus.READ);
                message.setReadAt(LocalDateTime.now());
                chatMessageRepository.save(message);

                // Notify sender that message was read
                notifyStatusUpdate(message, ChatMessage.MessageStatus.READ);
            }

            log.info("✅ {} messages marked as read from {} to {}", unreadMessages.size(), senderId, receiverId);
        } catch (Exception e) {
            log.error("❌ Error marking messages as read: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void markMessageAsDelivered(Long messageId, Long receiverId) {
        try {
            ChatMessage message = chatMessageRepository.findById(messageId).orElse(null);
            if (message != null && message.getReceiverId().equals(receiverId)) {
                if (message.getStatus() == ChatMessage.MessageStatus.SENT) {
                    message.setStatus(ChatMessage.MessageStatus.DELIVERED);
                    message.setDeliveredAt(LocalDateTime.now());
                    chatMessageRepository.save(message);

                    // Notify sender that message was delivered
                    notifyStatusUpdate(message, ChatMessage.MessageStatus.DELIVERED);

                    log.info("✅ Message {} marked as delivered to user {}", messageId, receiverId);
                }
            }
        } catch (Exception e) {
            log.error("❌ Error marking message as delivered: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long getUnreadMessageCount(Long userId) {
        try {
            long count = chatMessageRepository.countByReceiverIdAndStatus(
                    userId,
                    ChatMessage.MessageStatus.SENT
            );
            log.info("🔔 Unread count for user {}: {}", userId, count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error getting unread count: {}", e.getMessage(), e);
            return 0;
        }
    }

    private void notifyStatusUpdate(ChatMessage message, ChatMessage.MessageStatus newStatus) {
        try {
            // Notify the sender about status update
            String destination = "/user/" + message.getSenderId() + "/queue/message-status";

            var statusUpdate = new MessageStatusUpdate(
                    message.getId(),
                    newStatus,
                    LocalDateTime.now()
            );

            messagingTemplate.convertAndSendToUser(
                    message.getSenderId().toString(),
                    "/queue/message-status",
                    statusUpdate
            );

            log.info("📢 Notified sender {} about message {} status: {}",
                    message.getSenderId(), message.getId(), newStatus);

        } catch (Exception e) {
            log.error("❌ Error notifying status update: {}", e.getMessage());
        }
    }

    private String generateConversationId(Long user1, Long user2) {
        Long minId = Math.min(user1, user2);
        Long maxId = Math.max(user1, user2);
        return minId + "_" + maxId;
    }

    // DTO for status updates
    public record MessageStatusUpdate(Long messageId, ChatMessage.MessageStatus status, LocalDateTime timestamp) {}
}