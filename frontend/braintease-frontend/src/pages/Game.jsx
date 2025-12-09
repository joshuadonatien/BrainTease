import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { fetchQuestionsFromClueBase } from "../services/triviaApi";

export default function Game() {
  const { difficulty, questions, setQuestions } = useGame();

  useEffect(() => {
    async function loadQuestions() {
      const rawQuestions = await fetchQuestionsFromClueBase(10);

      // Map to your preferred format
      const mapped = rawQuestions.map((q) => ({
        question: q.clue,
        answer: q.response,
        category: q.category.title
      }));

      setQuestions(mapped);
    }

    loadQuestions();
  }, [setQuestions]);

  if (!difficulty) return <p>Select a difficulty first!</p>;
  if (questions.length === 0) return <p>Loading questions...</p>;

  return (
    <div>
      <h2>Difficulty: {difficulty.toUpperCase()}</h2>

      <h3>Sample Question:</h3>
      <p>{questions[0].question}</p>
      <p><strong>Category:</strong> {questions[0].category}</p>

      {/* Later you will add: Show multiple choice, scoring, next question etc. */}
    </div>
  );
}