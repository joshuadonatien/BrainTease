export async function submitScore(score) {
    const response = await fetch("http://127.0.0.1:8000/api/score/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ score })
    });
  
    if (!response.ok) {
      throw new Error("Failed to submit score");
    }
  
    return response.json();
  }
  