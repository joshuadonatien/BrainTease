import { apiGet, apiPost } from './api';

export async function fetchQuestions(difficulty = "easy") {
    console.log('🚀 fetchQuestions called with difficulty:', difficulty);
    try {
        const result = await apiGet(`/questions/?difficulty=${difficulty}`);
        console.log('✅ fetchQuestions raw result:', result);
        return result;
    } catch (error) {
        console.error('❌ fetchQuestions error:', error);
        throw error;
    }
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
  const data = await apiPost('/start-game/', {
    difficulty,
    amount,
    categories,
  });
  return data;
}
  