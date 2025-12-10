/**
 * Category service - fetches question categories from backend
 */
import { apiGet } from './api';

/**
 * Fetch available question categories
 * @returns {Promise<Array>} Array of category objects with id and name
 */
export async function fetchCategories() {
  // Categories endpoint is in questions app, not api app
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
  const response = await fetch(`${API_BASE_URL}/questions/categories/`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  const data = await response.json();
  return data.categories || [];
}

