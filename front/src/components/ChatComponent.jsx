import React, { useState, useEffect, useRef } from 'react';
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
        const history = await window.chatService.getConversation(currentUserId, otherUserId);

        if (isSubscribed) {
          console.log(`✅ Loaded ${history.length} messages`);
          setMessages(history);

          // Track loaded message IDs
          history.forEach(msg => {
            if (msg.id) processedMessageIds.current.add(msg.id);
          });
        }

        // Step 2: Mark messages as read
        await window.chatService.markAsRead(otherUserId, currentUserId);

        // Step 3: Subscribe to real-time messages
        console.log('🔔 Subscribing to real-time messages...');
        const subscribed = await window.chatService.subscribeToMessages(
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
        window.chatService.markAsRead(otherUserId, currentUserId);
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
      await window.chatService.sendMessage(
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

  const retryConnection = () => {
    window.location.reload();
  };

  return (
    <div className="chat-component">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <h3>{otherUserName}</h3>
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <button className="close-chat-btn" onClick={onClose} aria-label="Close chat">
          ✕
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
            <p>{error}</p>
            <button onClick={retryConnection} className="retry-btn">
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'} ${
                  msg.isTemp ? 'temp-message' : ''
                }`}
              >
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                    {msg.isTemp && ' ⏳'}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connected ? 'Type a message...' : 'Connecting...'}
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
            {sending ? '⏳' : '➤'}
          </button>
        </div>
        {!connected && !loading && (
          <div className="connection-warning">
            <span>⚠️ Reconnecting...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatComponent;
