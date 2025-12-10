/**
 * Multiplayer game service - handles all multiplayer API calls
 */
import { apiPost, apiGet } from './api';

/**
 * Create a new multiplayer session
 * @param {Object} options - Session options
 * @param {number} options.number_of_players - Target number of players (2-10)
 * @param {string} options.difficulty - "easy", "medium", or "hard"
 * @param {number} options.total_questions - Number of questions (1-50)
 * @returns {Promise<Object>} Session data with join_code
 */
export async function createMultiplayerSession(options) {
  const { number_of_players = 4, difficulty = 'easy', total_questions = 10 } = options;
  
  const payload = {
    number_of_players,
    difficulty,
    total_questions,
  };
  
  return await apiPost('/multiplayer/create', payload);
}

/**
 * Join an existing multiplayer session by join code
 * @param {string} joinCode - 6-character join code
 * @returns {Promise<Object>} Session data
 */
export async function joinMultiplayerSession(joinCode) {
  const payload = {
    join_code: joinCode.toUpperCase(),
  };
  
  return await apiPost('/multiplayer/join', payload);
}

/**
 * Get multiplayer session status by join code
 * @param {string} joinCode - 6-character join code
 * @returns {Promise<Object>} Full session data including scores and winners
 */
export async function getMultiplayerSession(joinCode) {
  return await apiGet(`/multiplayer/by-code/?join_code=${joinCode.toUpperCase()}`);
}

/**
 * Get multiplayer session status by session ID (UUID)
 * @param {string} sessionId - Session UUID
 * @returns {Promise<Object>} Full session data
 */
export async function getMultiplayerSessionById(sessionId) {
  return await apiGet(`/multiplayer/${sessionId}`);
}

/**
 * Submit score for a multiplayer session
 * @param {string} sessionId - Session UUID
 * @param {Object} scoreData - Score data
 * @param {number} scoreData.score - Total score
 * @param {number} [scoreData.correct_count] - Number of correct answers
 * @param {number} [scoreData.time_taken_seconds] - Time taken in seconds
 * @returns {Promise<Object>} Updated session data with winners if finished
 */
export async function submitMultiplayerScore(sessionId, scoreData) {
  const { score, correct_count, time_taken_seconds } = scoreData;
  
  const payload = {
    session_id: sessionId,
    score,
    correct_count,
    time_taken_seconds,
  };
  
  return await apiPost('/multiplayer/submit', payload);
}

