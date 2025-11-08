import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatComponent from './ChatComponent';
import chatService from '../services/chatService';
import './ChatButton.css';

const ChatButton = ({ currentUserId, otherUserId, otherUserName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUserId) {
      loadUnreadCount();

      // Refresh unread count every 10 seconds
      const interval = setInterval(loadUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const loadUnreadCount = async () => {
    try {
      const count = await chatService.getUnreadCount(currentUserId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0); // Reset to 0 on error
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && unreadCount > 0) {
      // Mark messages as read when opening chat
      setTimeout(() => {
        setUnreadCount(0);
        loadUnreadCount();
      }, 500);
    }
  };

  const handleClose = () => {
    setIsChatOpen(false);
    // Refresh unread count when closing
    setTimeout(loadUnreadCount, 500);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chat-floating-button ${isChatOpen ? 'active' : ''}`}
        onClick={handleChatToggle}
        aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
      >
        {isChatOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={handleClose}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <ChatComponent
              currentUserId={currentUserId}
              otherUserId={otherUserId}
              otherUserName={otherUserName}
              onClose={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
