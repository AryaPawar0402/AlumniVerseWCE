import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Send, X, WifiOff } from 'lucide-react';
import chatService from '../services/chatService';
import './ChatComponent.css';

const ChatComponent = ({ currentUserId, otherUserId, otherUserName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const processedMessageIds = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isSubscribed = true;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError('');
        processedMessageIds.current.clear();

        console.log('🔄 Initializing chat...');
        console.log('Current User:', currentUserId);
        console.log('Other User:', otherUserId);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Step 1: Load conversation history
        console.log('📖 Loading conversation history...');
        const history = await chatService.getConversation(currentUserId, otherUserId);

        if (isSubscribed) {
          console.log(`✅ Loaded ${history.length} messages`);
          setMessages(history);

          // Track loaded message IDs
          history.forEach(msg => {
            if (msg.id) processedMessageIds.current.add(msg.id);
          });
        }

        // Step 2: Mark messages as read
        await chatService.markAsRead(otherUserId, currentUserId);

        // Step 3: Subscribe to real-time messages
        console.log('🔔 Subscribing to real-time messages...');
        const subscribed = await chatService.subscribeToMessages(
          currentUserId,
          handleNewMessage,
          token
        );

        if (isSubscribed) {
          setConnected(subscribed);
          if (!subscribed) {
            setError('Could not establish real-time connection');
          }
        }

      } catch (err) {
        console.error('❌ Chat initialization error:', err);
        if (isSubscribed) {
          setError(err.message || 'Failed to initialize chat');
          setConnected(false);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    const handleNewMessage = (message) => {
      console.log('📨 New message received:', message);

      // Avoid duplicates
      if (message.id && processedMessageIds.current.has(message.id)) {
        console.log('⚠️ Duplicate message detected, skipping');
        return;
      }

      // Add to processed set
      if (message.id) {
        processedMessageIds.current.add(message.id);
      }

      // Remove temporary message if this is the real one
      setMessages(prev => {
        // Remove any temporary message from the same sender with similar content
        const filtered = prev.filter(msg => {
          if (msg.isTemp &&
              msg.senderId === message.senderId &&
              msg.content === message.content) {
            console.log('🗑️ Removing temporary message');
            return false;
          }
          return true;
        });

        // Add the new message
        console.log('✅ Adding message to chat');
        return [...filtered, message];
      });

      // Mark as read if from other user
      if (message.senderId === otherUserId) {
        chatService.markAsRead(otherUserId, currentUserId);
      }
    };

    initializeChat();

    return () => {
      console.log('🧹 Cleaning up chat component');
      isSubscribed = false;
    };
  }, [currentUserId, otherUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending || !connected) {
      return;
    }

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI update
    const tempMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: content,
      timestamp: new Date().toISOString(),
      status: 'SENT',
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('📤 Sending message...');
      await chatService.sendMessage(
        currentUserId,
        otherUserId,
        content,
        token
      );

      console.log('✅ Message sent, waiting for server confirmation...');

    } catch (err) {
      console.error('❌ Send error:', err);

      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(content);
      setError('Failed to send message. Please try again.');

      setTimeout(() => setError(''), 5000);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const renderMessageStatus = (message) => {
    if (message.senderId !== currentUserId) return null;

    if (message.isTemp) {
      return <Clock className="status-icon" size={14} />;
    }

    switch (message.status) {
      case 'READ':
        return <CheckCheck className="status-icon status-read" size={14} />;
      case 'DELIVERED':
        return <CheckCheck className="status-icon" size={14} />;
      case 'SENT':
        return <Check className="status-icon" size={14} />;
      default:
        return <Clock className="status-icon" size={14} />;
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach(msg => {
      const date = formatDate(msg.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  const retryConnection = () => {
    window.location.reload();
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-component">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-user-avatar">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div className="chat-user-info">
            <h3>{otherUserName}</h3>
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? (
                <>
                  <span className="status-dot"></span>
                  <span>online</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} />
                  <span>connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="close-chat-btn" onClick={onClose} aria-label="Close chat">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="chat-error">
            <AlertCircle size={48} />
            <p>{error}</p>
            <button onClick={retryConnection} className="retry-btn">
              Retry Connection
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet</p>
            <span>Send a message to start the conversation</span>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <div className="date-divider">
                  <span>{date}</span>
                </div>
                {msgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'} ${
                      msg.isTemp ? 'temp-message' : ''
                    }`}
                  >
                    <div className="message-bubble">
                      <div className="message-content">
                        <p>{msg.content}</p>
                      </div>
                      <div className="message-meta">
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                        {renderMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        {error && messages.length > 0 && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connected ? 'Type a message' : 'Connecting...'}
            disabled={!connected || sending}
            maxLength={500}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected || sending}
            className="send-btn"
            aria-label="Send message"
          >
            {sending ? (
              <div className="sending-spinner"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
