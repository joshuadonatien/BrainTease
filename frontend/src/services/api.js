// API service for connecting to Django backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Get auth token from Firebase
  async getAuthToken() {
    // We'll implement this with Firebase auth
    const user = await this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Get current Firebase user
  async getCurrentUser() {
    const { auth } = await import('./firebase');
    return auth.currentUser;
  }

  // Make authenticated API request
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // API Methods
  async getQuestions(difficulty = 'easy') {
    return this.request(`/questions/?difficulty=${difficulty}`);
  }

  async startGame() {
    return this.request('/start-game/', {
      method: 'POST',
    });
  }

  async submitScore(data) {
    return this.request('/submit-score/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeaderboard() {
    return this.request('/leaderboard/');
  }

  async useHint(sessionId) {
    return this.request(`/use-hint/${sessionId}/`, {
      method: 'POST',
    });
  }

  async updateDisplayName(displayName) {
    return this.request('/update-display-name/', {
      method: 'POST',
      body: JSON.stringify({ display_name: displayName }),
    });
  }
}

export default new ApiService();