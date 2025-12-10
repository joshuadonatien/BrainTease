// import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api/";

// export const api = axios.create({
//   baseURL: API_BASE,
// });

// // Interceptor to add Firebase auth token to requests
// api.interceptors.request.use(
//   async (config) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (user) {
//       const token = await user.getIdToken();
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

import axios from "axios";
import { auth } from "./firebase";

// API base URL - uses environment variable or defaults to localhost
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api/";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if auth is available and user is logged in
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        console.error('Authentication error - user may need to log in again');
        // Could redirect to login page here
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // Start a new game
  startGame: async (difficulty, amount = 10, categories = []) => {
    const response = await api.post('/start-game/', {
      difficulty,
      amount,
      categories
    });
    return response.data;
  },

  // Submit score
  submitScore: async (scoreData) => {
    const response = await api.post('/submit-score/', scoreData);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    const response = await api.get('/leaderboard/', { params });
    return response.data;
  },

  // Use hint
  useHint: async (sessionId, hintData) => {
    const response = await api.post(`/use-hint/${sessionId}/`, hintData);
    return response.data;
  },

  // Update display name
  updateDisplayName: async (displayName) => {
    const response = await api.post('/update-display-name/', { display_name: displayName });
    return response.data;
  },

  // Get questions
  getQuestions: async (params = {}) => {
    const response = await api.get('/questions/questions-proxy/', { params });
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/questions/categories/');
    return response.data;
  }
};

export default api;