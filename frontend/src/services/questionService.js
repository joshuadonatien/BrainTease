import apiService from './api';

export async function fetchQuestions(difficulty = "easy") {
  try {
    return await apiService.getQuestions(difficulty);
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}
  