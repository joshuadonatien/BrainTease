export async function fetchQuestions(difficulty = "easy") {
    const res = await fetch(
      `http://127.0.0.1:8000/api/questions/?difficulty=${difficulty}`
    );
  
    if (!res.ok) throw new Error("Failed to fetch questions");
  
    return res.json();
  }
  