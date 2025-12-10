import React, { useEffect, useState } from "react";
import { fetchQuestions } from "../services/questionService";
import QuestionCard from "../components/QuestionCard";

export default function GamePage() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchQuestions();
      setQuestions(data);
    }
    load();
  }, []);

  function handleAnswer(choice) {
    const correctAnswer = questions[index].answer;

    if (choice === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (index + 1 < questions.length) {
      setIndex((prev) => prev + 1);
    } else {
      setGameOver(true);
    }
  }

  if (questions.length === 0) {
    return <div style={{ padding: 30 }}>Loading questions...</div>;
  }

  if (gameOver) {
    return (
      <div style={{ padding: 30 }}>
        <h1>Game Over 🎉</h1>
        <h2>Your Score: {score}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Braintease Game</h1>
      <h3>Score: {score}</h3>

      <QuestionCard
        question={questions[index]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
