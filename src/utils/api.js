const API_BASE = 'http://localhost:5000/api';

const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Calendar
  parseCalendar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/calendar/parse`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getEvents: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/calendar/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Vents
  getVents: async () => {
    const response = await fetch(`${API_BASE}/vents`);
    return response.json();
  },

  postVent: async (content) => {
    const response = await fetch(`${API_BASE}/vents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return response.json();
  },

  // Mess Ratings
  submitRating: async (rating) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/mess/rate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating })
    });
    return response.json();
  },

  getRatings: async () => {
    const response = await fetch(`${API_BASE}/mess/ratings`);
    return response.json();
  },

  // Tips
  getTips: async () => {
    const response = await fetch(`${API_BASE}/tips`);
    return response.json();
  },

  postTip: async (tipData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tips`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tipData)
    });
    return response.json();
  },

  // Complaints
  submitComplaint: async (complaintData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });
    return response.json();
  },

  getComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/complaints`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};

export default api;
