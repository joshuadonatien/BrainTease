/**
 * Category service - fetches question categories from backend
 */
import { apiGet } from './api';

/**
 * Fetch available question categories
 * @returns {Promise<Array>} Array of category objects with id and name
 */
export async function fetchCategories() {
  try {
    // Categories endpoint is at /api/categories/ (questions.urls is included under /api/)
    const data = await apiGet('/categories/');
    console.log("Categories fetched:", data);
    
    // Handle both {categories: [...]} and direct array responses
    if (Array.isArray(data)) {
      return data;
    }
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

