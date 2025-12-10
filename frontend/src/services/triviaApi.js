export async function fetchTriviaQuestion() {
    const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = await response.json();
    return data.results[0];
  }
  