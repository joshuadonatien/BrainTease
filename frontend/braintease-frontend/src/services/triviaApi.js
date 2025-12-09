// Mock data as fallback
const MOCK_QUESTIONS = [
  {
    clue: "This planet is known as the Red Planet",
    response: "Mars",
    category: { title: "Science" },
    incorrect_answers: ["Venus", "Jupiter", "Saturn"]
  },
  {
    clue: "The capital of France",
    response: "Paris",
    category: { title: "Geography" },
    incorrect_answers: ["London", "Berlin", "Madrid"]
  },
  {
    clue: "The largest ocean on Earth",
    response: "Pacific Ocean",
    category: { title: "Geography" },
    incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]
  },
  {
    clue: "The author of 'Romeo and Juliet'",
    response: "William Shakespeare",
    category: { title: "Literature" },
    incorrect_answers: ["Charles Dickens", "Jane Austen", "Mark Twain"]
  },
  {
    clue: "The chemical symbol for gold",
    response: "Au",
    category: { title: "Science" },
    incorrect_answers: ["Go", "Gd", "Ag"]
  },
  {
    clue: "The year the United States declared independence",
    response: "1776",
    category: { title: "History" },
    incorrect_answers: ["1765", "1783", "1800"]
  },
  {
    clue: "The largest mammal in the world",
    response: "Blue Whale",
    category: { title: "Science" },
    incorrect_answers: ["Elephant", "Giraffe", "Hippopotamus"]
  },
  {
    clue: "The speed of light in a vacuum",
    response: "299,792,458 meters per second",
    category: { title: "Science" },
    incorrect_answers: ["150,000,000 m/s", "500,000,000 m/s", "100,000,000 m/s"]
  },
  {
    clue: "The programming language created by Guido van Rossum",
    response: "Python",
    category: { title: "Technology" },
    incorrect_answers: ["Java", "JavaScript", "Ruby"]
  },
  {
    clue: "The smallest country in the world",
    response: "Vatican City",
    category: { title: "Geography" },
    incorrect_answers: ["Monaco", "San Marino", "Liechtenstein"]
  }
];

export async function fetchQuestionsFromClueBase(amount = 10) {
  // For now, use mock data to avoid API rate limits
  console.log("Using mock questions for development");
  
  // Shuffle and return the requested amount
  const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, amount);
  
  /* Uncomment this when you want to try the real API again
  const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch questions");
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      return data.results.map(q => ({
        clue: decodeHTML(q.question),
        response: decodeHTML(q.correct_answer),
        category: { title: decodeHTML(q.category) },
        incorrect_answers: q.incorrect_answers.map(ans => decodeHTML(ans))
      }));
    }
    return [];
  } catch (err) {
    console.error("Trivia API Error:", err);
    return MOCK_QUESTIONS.slice(0, amount); // Fallback to mock
  }
  */
}

// Helper function to decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}