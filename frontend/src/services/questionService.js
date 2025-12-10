import { apiPost } from './api';

export async function fetchQuestions(difficulty = "easy") {
    const res = await fetch(
      `http://127.0.0.1:8000/api/questions/?difficulty=${difficulty}`
    );
  
    if (!res.ok) throw new Error("Failed to fetch questions");
  
    return res.json();
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
  