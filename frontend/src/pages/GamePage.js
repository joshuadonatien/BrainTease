import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchQuestions } from "../services/questionService";
import QuestionCard from "../components/QuestionCard.jsx";
import GameOver from "../components/GameOver.jsx";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const difficulty = searchParams.get('difficulty') || 'easy';
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching questions for difficulty:', difficulty);
        const response = await fetchQuestions(difficulty);
        console.log('📥 Raw API response:', response);
        
        // Handle the API response structure: { success: true, questions: [...] }
        let questionsData = [];
        if (response && response.questions) {
          questionsData = response.questions;
        } else if (Array.isArray(response)) {
          questionsData = response;
        } else {
          console.error('❌ Unexpected response format:', response);
          setError('Invalid response format from server');
          return;
        }
        
        console.log('📋 Questions data:', questionsData);
        console.log('📊 Number of questions:', questionsData.length);
        
        if (questionsData.length === 0) {
          setError('No questions found for this difficulty level.');
          return;
        }
        
        // Log first question to check structure
        if (questionsData[0]) {
          console.log('🔍 First question structure:', questionsData[0]);
        }
        
        setQuestions(questionsData);
      } catch (err) {
        console.error('💥 Error loading questions:', err);
        setError(`Failed to load questions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [difficulty]);

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

  if (loading) {
    return <div style={{ padding: 30 }}>Loading questions...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div style={{ padding: 30 }}>No questions available.</div>;
  }

  if (gameOver) {
    return (
      <GameOver
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        onPlayAgain={() => {
          setGameOver(false);
          setScore(0);
          setIndex(0);
        }}
        onGoHome={() => navigate('/')}
      />
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Braintease Game - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h1>
      <h3>Score: {score} / {questions.length}</h3>
      <p>Question {index + 1} of {questions.length}</p>

      <QuestionCard
        question={questions[index]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
