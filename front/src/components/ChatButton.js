import React, { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import './ChatButton.css';

const ChatButton = ({ currentUserId, otherUserId, otherUserName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUserId) {
      loadUnreadCount();

      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const loadUnreadCount = async () => {
    try {
      const count = await window.chatService.getUnreadCount(currentUserId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0); // Reset to 0 on error
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && unreadCount > 0) {
      setUnreadCount(0); // Reset unread count when opening chat
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="chat-floating-button" onClick={handleChatToggle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <ChatComponent
              currentUserId={currentUserId}
              otherUserId={otherUserId}
              otherUserName={otherUserName}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;