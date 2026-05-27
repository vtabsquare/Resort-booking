import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = {
  // Generic methods
  getAll: async (table) => {
    try {
      const response = await axios.get(`${API_BASE}/${table}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
  },

  create: async (table, data) => {
    try {
      const response = await axios.post(`${API_BASE}/${table}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating in ${table}:`, error);
      throw error;
    }
  },

  update: async (table, id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${table}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating in ${table}:`, error);
      throw error;
    }
  },

  remove: async (table, id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${table}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { username, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_BASE}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE}/verify-otp`, { email, otp });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  resetPassword: async (email, newUsername, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE}/reset-password`, {
        email,
        new_username: newUsername,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting credentials:', error);
      throw error;
    }
  },

  sendFinalBill: async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/bookings/${id}/send-final-bill`);
      return response.data;
    } catch (error) {
      console.error(`Error sending final bill for booking ${id}:`, error);
      throw error;
    }
  },

  registerLoginCustomer: async (customerData) => {
    try {
      const response = await axios.post(`${API_BASE}/customers/register-login`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error logging in customer:', error);
      throw error;
    }
  },

  getCustomerBookings: async (email, phone = '') => {
    try {
      const response = await axios.get(`${API_BASE}/customers/bookings`, { params: { email, phone } });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  },

  requestCancellation: async (id, reason) => {
    try {
      const response = await axios.post(`${API_BASE}/bookings/${id}/request-cancellation`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error requesting cancellation for booking ${id}:`, error);
      throw error;
    }
  },

  approveCancellation: async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/bookings/${id}/approve-cancellation`);
      return response.data;
    } catch (error) {
      console.error(`Error approving cancellation for booking ${id}:`, error);
      throw error;
    }
  },

  rejectCancellation: async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/bookings/${id}/reject-cancellation`);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting cancellation for booking ${id}:`, error);
      throw error;
    }
  }
};

export default api;

