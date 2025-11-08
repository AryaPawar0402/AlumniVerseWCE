package com.alumniportal.alumni.dto;

import com.alumniportal.alumni.entity.ChatMessage;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private ChatMessage.MessageStatus status;
    private String conversationId;
    private String senderName;
    private String receiverName;

    public static ChatMessageDTO fromEntity(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .status(message.getStatus())
                .conversationId(message.getConversationId())
                .build();
    }
}
