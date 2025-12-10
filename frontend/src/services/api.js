/**
 * API utility for making authenticated requests to the backend
 */
import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    return null; // Return null for guest users instead of throwing
  }
  return await user.getIdToken();
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
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    // If authentication fails, let the backend handle it
    // Don't throw here - some endpoints might work without auth
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    // Handle both error.error and error.message formats
    const errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
    throw new Error(errorMessage);
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

