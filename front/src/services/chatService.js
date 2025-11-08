import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = 'http://localhost:8080/api';
const WS_BASE_URL = 'http://localhost:8080';

class ChatService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
    this.connectionPromise = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(token) {
    // Return existing connection if already connected
    if (this.isConnected()) {
      console.log('✅ Already connected to WebSocket');
      return true;
    }

    // Return pending connection promise if connecting
    if (this.connectionPromise) {
      console.log('⏳ Connection already in progress');
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🔌 Initiating WebSocket connection...');

        const socket = new SockJS(`${WS_BASE_URL}/ws`);

        this.stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: (str) => {
            console.log('📡 STOMP:', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: (frame) => {
            console.log('✅ WebSocket Connected:', frame);
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            resolve(true);
          },
          onStompError: (frame) => {
            console.error('❌ STOMP Error:', frame);
            this.isConnecting = false;
            this.connectionPromise = null;
            reject(new Error('STOMP error: ' + frame.headers.message));
          },
          onWebSocketError: (error) => {
            console.error('❌ WebSocket Error:', error);
            this.isConnecting = false;
            this.connectionPromise = null;
            reject(error);
          },
          onDisconnect: () => {
            console.log('🔌 WebSocket Disconnected');
            this.isConnecting = false;
            this.connectionPromise = null;
          }
        });

        this.isConnecting = true;
        this.stompClient.activate();

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            console.error('❌ Connection timeout');
            this.isConnecting = false;
            this.connectionPromise = null;
            reject(new Error('Connection timeout after 10 seconds'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Ensure WebSocket connection is established
   */
  async ensureConnected(token) {
    if (this.isConnected()) {
      return true;
    }
    return await this.connect(token);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    this.subscriptions.forEach((sub, key) => {
      try {
        sub.unsubscribe();
        console.log(`✅ Unsubscribed from ${key}`);
      } catch (e) {
        console.warn('⚠️ Error unsubscribing:', e);
      }
    });

    this.subscriptions.clear();
    this.connectionPromise = null;
    this.isConnecting = false;

    console.log('✅ WebSocket disconnected');
  }

  /**
   * Subscribe to messages for a specific user
   */
  async subscribeToMessages(userId, callback, token) {
    try {
      console.log(`🔔 Subscribing to messages for user ${userId}...`);

      // Ensure connection
      const connected = await this.ensureConnected(token);
      if (!connected) {
        throw new Error('Failed to connect to WebSocket');
      }

      // Check if already subscribed
      const subKey = `user-${userId}-messages`;
      if (this.subscriptions.has(subKey)) {
        console.log(`⚠️ Already subscribed for user ${userId}`);
        return true;
      }

      // Subscribe to user's message queue
      const subscription = this.stompClient.subscribe(
        `/user/${userId}/queue/messages`,
        (message) => {
          console.log('📨 Message received via WebSocket:', message);
          try {
            const chatMessage = JSON.parse(message.body);
            console.log('✅ Parsed message:', chatMessage);
            callback(chatMessage);
          } catch (error) {
            console.error('❌ Error parsing message:', error);
          }
        }
      );

      this.subscriptions.set(subKey, subscription);
      console.log(`✅ Subscribed to /user/${userId}/queue/messages`);

      return true;
    } catch (error) {
      console.error('❌ Error subscribing to messages:', error);
      return false;
    }
  }

  /**
   * Subscribe to message status updates - NEW METHOD
   */
  async subscribeToMessageStatus(userId, callback, token) {
    try {
      console.log(`📊 Subscribing to message status for user ${userId}...`);

      // Ensure connection
      const connected = await this.ensureConnected(token);
      if (!connected) {
        throw new Error('Failed to connect to WebSocket');
      }

      // Check if already subscribed
      const subKey = `user-${userId}-status`;
      if (this.subscriptions.has(subKey)) {
        console.log(`⚠️ Already subscribed to status for user ${userId}`);
        return true;
      }

      // Subscribe to user's status updates
      const subscription = this.stompClient.subscribe(
        `/user/${userId}/queue/message-status`,
        (message) => {
          console.log('📊 Message status update received:', message);
          try {
            const statusUpdate = JSON.parse(message.body);
            console.log('✅ Parsed status update:', statusUpdate);
            callback(statusUpdate);
          } catch (error) {
            console.error('❌ Error parsing status update:', error);
          }
        }
      );

      this.subscriptions.set(subKey, subscription);
      console.log(`✅ Subscribed to /user/${userId}/queue/message-status`);

      return true;
    } catch (error) {
      console.error('❌ Error subscribing to message status:', error);
      return false;
    }
  }

  /**
   * Send a message via WebSocket
   */
  async sendMessage(senderId, receiverId, content, token) {
    try {
      console.log(`📤 Sending message: ${senderId} -> ${receiverId}`);

      // Ensure connection
      const connected = await this.ensureConnected(token);
      if (!connected || !this.isConnected()) {
        throw new Error('WebSocket not connected');
      }

      const message = {
        senderId: senderId,
        receiverId: receiverId,
        content: content
      };

      console.log('📤 Publishing to /app/sendMessage:', message);

      this.stompClient.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify(message)
      });

      console.log('✅ Message published successfully');
      return true;

    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark message as delivered - NEW METHOD
   */
  async markAsDelivered(messageId, receiverId) {
    try {
      console.log(`📬 Marking message ${messageId} as delivered to ${receiverId}`);

      const response = await axios.post(
        `${API_BASE_URL}/chat/markDelivered/${messageId}/${receiverId}`,
        {},
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Message marked as delivered:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking as delivered:', error);
      // Don't throw error here to avoid breaking the flow
      return null;
    }
  }

  /**
   * Get conversation history via REST API
   */
  async getConversation(user1, user2) {
    try {
      console.log(`📖 Fetching conversation: ${user1} <-> ${user2}`);

      const response = await axios.get(
        `${API_BASE_URL}/chat/conversation/${user1}/${user2}`,
        { headers: this.getAuthHeaders() }
      );

      console.log(`✅ Loaded ${response.data.length} messages`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read via REST API
   */
  async markAsRead(senderId, receiverId) {
    try {
      await axios.post(
        `${API_BASE_URL}/chat/markAsRead/${senderId}/${receiverId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ Messages marked as read: ${senderId} -> ${receiverId}`);
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }

  /**
   * Get unread message count via REST API
   */
  async getUnreadCount(userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/unreadCount/${userId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.count || 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Test backend connection
   */
  async testConnection() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/debug/status`,
        { headers: this.getAuthHeaders() }
      );
      console.log('🔧 Connection test:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No authentication token found');
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }

  /**
   * Cleanup all subscriptions and disconnect
   */
  cleanup() {
    console.log('🧹 Cleaning up chat service...');
    this.disconnect();
    this.subscriptions.clear();
  }
}

// Create and export singleton instance
const chatService = new ChatService();
window.chatService = chatService; // Make available globally for debugging

export { chatService };
export default chatService;