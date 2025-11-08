import api from "../config/api";

export const connectionService = {
  getSuggestedAlumni: async (studentId) => {
    try {
      const response = await api.get(`/connections/suggested/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Get suggested alumni error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch suggested alumni');
    }
  },

  sendConnectionRequest: async (studentId, alumniId) => {
    try {
      const response = await api.post(`/connections/send?studentId=${studentId}&alumniId=${alumniId}`);
      return response.data;
    } catch (error) {
      console.error('Send connection request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send connection request');
    }
  },

  getPendingRequests: async (alumniId) => {
    try {
      const response = await api.get(`/connections/pending/${alumniId}`);
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw new Error('Failed to fetch pending requests');
    }
  },

  acceptRequest: async (connectionId) => {
    try {
      const response = await api.post(`/connections/accept/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Accept request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept connection');
    }
  },

  rejectRequest: async (connectionId) => {
    try {
      const response = await api.post(`/connections/reject/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Reject request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject connection');
    }
  },

  getStudentConnections: async (studentId) => {
    try {
      const response = await api.get(`/connections/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Get student connections error:', error);
      throw new Error('Failed to fetch student connections');
    }
  },

  getAlumniConnections: async (alumniId) => {
    try {
      const response = await api.get(`/connections/alumni/${alumniId}`);
      return response.data;
    } catch (error) {
      console.error('Get alumni connections error:', error);
      throw new Error('Failed to fetch alumni connections');
    }
  },

  getAllAlumni: async () => {
    try {
      const response = await api.get("/connections/allAlumni");
      return response.data;
    } catch (error) {
      console.error('Get all alumni error:', error);
      throw new Error('Failed to fetch alumni list');
    }
  },

  getConnectionStatus: async (studentId) => {
    try {
      const response = await api.get(`/connections/status/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Get connection status error:', error);
      throw new Error('Failed to fetch connection status');
    }
  },

  // FIXED: Use the correct endpoint path
  getStudentProfile: async (studentId) => {
    try {
      const response = await api.get(`/connections/students/${studentId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get student profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch student profile');
    }
  },

  // NEW: Get alumni profile by ID
  getAlumniProfile: async (alumniId) => {
    try {
      const response = await api.get(`/connections/alumni/${alumniId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get alumni profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch alumni profile');
    }
  },

  // Debug method
  testConnection: async (connectionId) => {
    try {
      const response = await api.get(`/connections/test-accept/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Test connection error:', error);
      throw new Error('Failed to test connection');
    }
  },
};