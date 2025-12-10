import { apiPost, apiGet } from './api';

/**
 * Fetch questions from the backend API
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @returns {Promise<Object>} Questions data
 */
export async function fetchQuestions(difficulty = "easy") {
  return await apiGet(`/questions/?difficulty=${difficulty}`);
}

/**
 * Start a game session and get questions
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @param {number} amount - Number of questions
 * @param {Array} categories - Optional category IDs
 * @param {string} boardSeed - Optional seed for consistent question ordering
 * @returns {Promise<Object>} Game data with questions
 */
export async function startGame(difficulty = "easy", amount = 10, categories = [], boardSeed = null) {
  try {
    const data = await apiPost('/start-game/', {
      difficulty,
      amount,
      categories,
    });
    console.log("startGame API response:", data);
    return data;
  } catch (error) {
    console.error("startGame API error:", error);
    throw error;
  }
}
  