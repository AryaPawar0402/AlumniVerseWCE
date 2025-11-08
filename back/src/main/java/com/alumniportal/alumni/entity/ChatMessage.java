package com.alumniportal.alumni.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_conversation_id", columnList = "conversation_id"),
        @Index(name = "idx_sender_receiver", columnList = "sender_id, receiver_id"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public enum MessageStatus {
        SENT, DELIVERED, READ
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Helper method to check if message is delivered
    public boolean isDelivered() {
        return status == MessageStatus.DELIVERED || status == MessageStatus.READ;
    }

    // Helper method to check if message is read
    public boolean isRead() {
        return status == MessageStatus.READ;
    }
}