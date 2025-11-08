package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm WHERE " +
            "(cm.senderId = :user1 AND cm.receiverId = :user2) OR " +
            "(cm.senderId = :user2 AND cm.receiverId = :user1) " +
            "ORDER BY cm.timestamp ASC")
    List<ChatMessage> findConversationBetweenUsers(
            @Param("user1") Long user1,
            @Param("user2") Long user2);

    @Query("SELECT cm FROM ChatMessage cm WHERE " +
            "cm.conversationId = :conversationId " +
            "ORDER BY cm.timestamp ASC")
    List<ChatMessage> findByConversationIdOrderByTimestampAsc(
            @Param("conversationId") String conversationId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE " +
            "cm.receiverId = :receiverId AND cm.status = :status")
    long countByReceiverIdAndStatus(
            @Param("receiverId") Long receiverId,
            @Param("status") ChatMessage.MessageStatus status);

    @Query("SELECT cm FROM ChatMessage cm WHERE " +
            "cm.senderId = :senderId AND cm.receiverId = :receiverId AND cm.status = 'SENT'")
    List<ChatMessage> findUnreadMessages(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage cm SET cm.status = 'READ' WHERE " +
            "cm.senderId = :senderId AND cm.receiverId = :receiverId AND cm.status = 'SENT'")
    void markMessagesAsRead(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId);
}