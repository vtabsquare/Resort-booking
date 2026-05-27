import axios from 'axios';

let rawApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
if (rawApiBase && !rawApiBase.endsWith('/api') && !rawApiBase.endsWith('/api/')) {
  rawApiBase = rawApiBase.replace(/\/+$/, '') + '/api';
}
const API_BASE = rawApiBase;

// Helper to resolve relative /uploads/ paths to absolute backend URLs in responses
function resolveUploadUrls(data) {
  if (!data) return data;
  
  const backendBase = API_BASE.replace(/\/api\/?$/, '');
  const resolveStr = (str) => {
    if (typeof str === 'string' && str.startsWith('/uploads/')) {
      return `${backendBase}${str}`;
    }
    return str;
  };
  
  if (typeof data === 'string') {
    if ((data.startsWith('[') && data.endsWith(']')) || (data.startsWith('{') && data.endsWith('}'))) {
      try {
        const parsed = JSON.parse(data);
        const resolved = resolveUploadUrls(parsed);
        return JSON.stringify(resolved);
      } catch (e) {
        return resolveStr(data);
      }
    }
    return resolveStr(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => resolveUploadUrls(item));
  }
  
  if (typeof data === 'object') {
    const copy = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = resolveUploadUrls(data[key]);
      }
    }
    return copy;
  }
  
  return data;
}

// Helper to strip the absolute backend URL from /uploads/ paths in requests
function stripUploadUrls(data) {
  if (!data) return data;
  
  const backendBase = API_BASE.replace(/\/api\/?$/, '');
  const stripStr = (str) => {
    if (typeof str === 'string' && str.startsWith(backendBase + '/uploads/')) {
      return str.substring(backendBase.length);
    }
    return str;
  };
  
  if (typeof data === 'string') {
    if ((data.startsWith('[') && data.endsWith(']')) || (data.startsWith('{') && data.endsWith('}'))) {
      try {
        const parsed = JSON.parse(data);
        const stripped = stripUploadUrls(parsed);
        return JSON.stringify(stripped);
      } catch (e) {
        return stripStr(data);
      }
    }
    return stripStr(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => stripUploadUrls(item));
  }
  
  if (typeof data === 'object') {
    const copy = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = stripUploadUrls(data[key]);
      }
    }
    return copy;
  }
  
  return data;
}

const api = {
  // Generic methods
  getAll: async (table) => {
    try {
      const response = await axios.get(`${API_BASE}/${table}`);
      return resolveUploadUrls(response.data);
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
  },

  create: async (table, data) => {
    try {
      const strippedData = stripUploadUrls(data);
      const response = await axios.post(`${API_BASE}/${table}`, strippedData);
      return resolveUploadUrls(response.data);
    } catch (error) {
      console.error(`Error creating in ${table}:`, error);
      throw error;
    }
  },

  update: async (table, id, data) => {
    try {
      const strippedData = stripUploadUrls(data);
      const response = await axios.put(`${API_BASE}/${table}/${id}`, strippedData);
      return resolveUploadUrls(response.data);
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

