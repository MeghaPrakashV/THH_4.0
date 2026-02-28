const fs = require('fs');

const code = `import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/hostel-survival-kit/us-central1/api';

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = await auth.currentUser?.getIdToken();
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: \`Bearer \${token}\` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(\`\${BASE_URL}\${endpoint}\`, options);
  return res.json();
};

const api = {
  registerUser: (displayName, role) => apiCall('/auth/register', 'POST', { displayName, role }),
  getMe: () => apiCall('/auth/me'),
  getEvents: () => apiCall('/calendar/events'),
  addEvent: (data) => apiCall('/calendar/events', 'POST', data),
  updateEvent: (id, data) => apiCall(\`/calendar/events/\${id}\`, 'PUT', data),
  deleteEvent: (id) => apiCall(\`/calendar/events/\${id}\`, 'DELETE'),
  getCountdown: () => apiCall('/calendar/countdown'),
  parseCalendar: (fileUrl) => apiCall('/calendar/parse', 'POST', { fileUrl }),
  getVents: (sort = 'recent') => apiCall(\`/vents?sort=\${sort}\`),
  postVent: (content) => apiCall('/vents', 'POST', { content }),
  likeVent: (id) => apiCall(\`/vents/\${id}/like\`, 'POST'),
  submitRating: (rating, meal, comment) => apiCall('/mess/rate', 'POST', { rating, meal, comment }),
  getMessStats: () => apiCall('/mess/stats'),
  getTips: (tag) => apiCall(\`/tips\${tag ? \`?tag=\${tag}\` : ''}\`),
  addTip: (data) => apiCall('/tips', 'POST', data),
  upvoteTip: (id) => apiCall(\`/tips/\${id}/upvote\`, 'POST'),
  getLeaderboard: () => apiCall('/tips/leaderboard'),
  submitComplaint: (data) => apiCall('/complaints', 'POST', data),
  getMyComplaints: () => apiCall('/complaints/my'),
  getAllComplaints: (status) => apiCall(\`/complaints/all\${status ? \`?status=\${status}\` : ''}\`),
  updateComplaintStatus: (id, status, note) => apiCall(\`/complaints/\${id}/status\`, 'PUT', { status, note }),
};

export default api;`;

fs.writeFileSync('src/utils/api.js', code);
console.log('Done!');