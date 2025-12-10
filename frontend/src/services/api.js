/**
 * API utility for making authenticated requests to the backend
 */
import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Get Firebase ID token for authenticated requests
 * Forces token refresh to ensure we have a valid token
 */
async function getAuthToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  try {
    // Force refresh to get a new token (helps if token expired)
    const token = await user.getIdToken(forceRefresh);
    console.log("Got auth token:", token ? "Token received" : "No token");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
}

/**
 * Make an authenticated API request
 * Automatically includes Firebase ID token in Authorization header
 */
export async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Firebase authentication token
  try {
    // Try to get token, force refresh if first attempt fails
    let token;
    try {
      token = await getAuthToken(false);
    } catch (error) {
      console.warn("First token attempt failed, trying with force refresh:", error.message);
      token = await getAuthToken(true);
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("Auth token added to request");
    } else {
      console.warn("No auth token available");
    }
  } catch (error) {
    // If authentication fails, log it but don't throw
    // Some endpoints might work without auth, but most require it
    console.error("Could not get auth token:", error.message);
    // For authenticated endpoints, this will cause a 401 which is handled below
  }
  
  console.log(`Making API request to: ${API_BASE_URL}${url}`, { method: options.method || 'GET' });
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  console.log(`API response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error("API error response:", errorData);
    } catch (e) {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    // Handle both error.error and error.message formats
    const errorMessage = errorData.error || errorData.message || errorData.detail || `API Error: ${response.status}`;
    
    // Provide more specific error messages based on status code
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in and try again.");
    } else if (response.status === 403) {
      throw new Error("Access denied. Please sign in and try again.");
    } else {
      throw new Error(errorMessage);
    }
  }
  
  return response.json();
}

/**
 * GET request
 */
export async function apiGet(url) {
  return apiRequest(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost(url, data) {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function apiPut(url, data) {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function apiDelete(url) {
  return apiRequest(url, { method: 'DELETE' });
}

/**
 * Submit game score
 */
export async function submitScore(scoreData) {
  return apiPost('/submit-score/', scoreData);
}

