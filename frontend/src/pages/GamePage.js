import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startGame } from "../services/questionService";
import { submitScore, apiPost } from "../services/api";
import QuestionCard from "../components/QuestionCard";

export default function GamePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get("difficulty") || "easy";
  const categoriesParam = searchParams.get("categories");
  const categories = categoriesParam ? categoriesParam.split(",").map(Number) : [];
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [allowedHints, setAllowedHints] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      console.warn("User not authenticated:", { isAuthenticated, user: user?.uid });
      setError("Please sign in to play. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    console.log("User authenticated, starting game load:", { uid: user.uid, email: user.email });

    async function loadGame() {
      try {
        setLoading(true);
        setError("");
        
        console.log("Starting game with:", { difficulty, categories, user: user?.uid });
        
        // Start game session and get questions
        const gameData = await startGame(difficulty, 10, categories);
        
        console.log("Game data received:", gameData);
        
        // Validate response
        if (!gameData) {
          throw new Error("No response from server");
        }
        
        if (!gameData.questions || !Array.isArray(gameData.questions)) {
          throw new Error("Invalid response from server: missing questions array");
        }
        
        if (gameData.questions.length === 0) {
          throw new Error("No questions received from server. Please try a different difficulty or category.");
        }
        
        // Store session ID and hint info for score submission and hints
        setSessionId(gameData.session_id);
        setAllowedHints(gameData.allowed_hints || 0);
        setHintsUsed(gameData.hints_used || 0);
        
        // Transform questions to match QuestionCard format
        const transformedQuestions = gameData.questions.map((q, idx) => {
          if (!q) {
            console.error(`Question is null/undefined at index ${idx}`);
            throw new Error(`Invalid question data received from server (question ${idx + 1})`);
          }
          
          if (!q.shuffled_answers || !Array.isArray(q.shuffled_answers)) {
            console.error(`Invalid question format at index ${idx}:`, q);
            throw new Error(`Invalid question format: missing shuffled_answers (question ${idx + 1})`);
          }
          
          if (!q.correct_answer) {
            console.error(`Missing correct_answer at index ${idx}:`, q);
            throw new Error(`Invalid question format: missing correct_answer (question ${idx + 1})`);
          }
          
          const correctIndex = q.shuffled_answers.indexOf(q.correct_answer);
          if (correctIndex === -1) {
            console.error(`Correct answer not found in shuffled answers (question ${idx + 1}):`, {
              correct_answer: q.correct_answer,
              shuffled_answers: q.shuffled_answers
            });
            throw new Error(`Question data error: correct answer "${q.correct_answer}" not found in options (question ${idx + 1})`);
          }
          
          return {
            question: q.question || "",
            options: q.shuffled_answers,
            answer: correctIndex,
            correct_answer: q.correct_answer,
          };
        });
        
        console.log(`Successfully transformed ${transformedQuestions.length} questions`);
        setQuestions(transformedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Error loading game:", err);
        let errorMessage = err.message || "Failed to load game";
        
        // Provide more helpful error messages
        if (errorMessage.includes("401") || errorMessage.includes("authentication") || errorMessage.includes("User not authenticated") || errorMessage.includes("Authentication required")) {
          errorMessage = "Authentication required. Please sign in to play.";
          // Redirect to login after showing error
          setTimeout(() => navigate("/login"), 3000);
        } else if (errorMessage.includes("403") || errorMessage.includes("Access denied")) {
          // 403 might mean token is invalid or expired - try refreshing
          errorMessage = "Your session may have expired. Please sign in again.";
          setTimeout(() => navigate("/login"), 3000);
        } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    }
    
    loadGame();
  }, [difficulty, categories.join(","), isAuthenticated, user, navigate]);

  function handleAnswer(choiceIndex) {
    const currentQuestion = questions[index];
    const isCorrect = choiceIndex === currentQuestion.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    }

    const nextIndex = index + 1;
    
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      // Game over - submit score
      handleGameOver(isCorrect);
    }
  }

  async function handleGameOver(lastAnswerCorrect) {
    setGameOver(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = score + (lastAnswerCorrect ? 1 : 0);
    const finalCorrectCount = correctCount + (lastAnswerCorrect ? 1 : 0);

    try {
      // Submit score to backend
      const result = await submitScore({
        score: finalScore,
        difficulty: difficulty,
        correct_count: finalCorrectCount,
        total_questions: questions.length,
        time_taken_seconds: timeTaken,
        categories: categories,
      });
      
      // Navigate to results page with top-5 status
      navigate("/final-score", { 
        state: { 
          score: finalScore, 
          totalQuestions: questions.length,
          correctCount: finalCorrectCount,
          difficulty: difficulty,
          isTop5: result.is_top_5 || false,
          rank: result.rank || null,
        } 
      });
    } catch (err) {
      console.error("Failed to submit score:", err);
      // Still navigate to results even if submission fails
      navigate("/final-score", { 
        state: { 
          score: finalScore, 
          totalQuestions: questions.length,
          correctCount: finalCorrectCount,
          difficulty: difficulty,
          isTop5: false,
          rank: null,
        } 
      });
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 20 }}>⏳</div>
        <div style={{ fontSize: 18, color: "#666" }}>Loading questions...</div>
        <div style={{ fontSize: 14, color: "#999", marginTop: 10 }}>
          This may take a few seconds
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: 100, maxWidth: 600, margin: "0 auto", padding: 40, textAlign: "center" }}>
        <div style={{ 
          background: "white", 
          borderRadius: 16, 
          padding: 40,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#d32f2f", marginBottom: 20 }}>⚠️ Error Loading Game</h2>
          <div style={{ color: "#666", marginBottom: 30, fontSize: 16 }}>
            {error}
          </div>
          <div style={{ marginBottom: 20, fontSize: 14, color: "#999" }}>
            Make sure you're signed in and try again.
          </div>
          <button 
            onClick={() => navigate("/difficulty")}
            style={{
              padding: "12px 24px",
              background: "#5b9491",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Back to Difficulty Selection
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div style={{ padding: 30, textAlign: "center" }}>No questions available</div>;
  }

  if (gameOver) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <h1>Game Over! 🎉</h1>
        <p>Submitting your score...</p>
      </div>
    );
  }

  const currentQuestion = questions[index];

  return (
    <div style={{ paddingTop: 100, maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 30,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 20
        }}>
          <h2 style={{ margin: 0, color: "#5b9491" }}>
            Question {index + 1} / {questions.length}
          </h2>
          <div style={{ 
            fontSize: 24, 
            fontWeight: "bold", 
            color: "#5b9491" 
          }}>
            Score: {score}
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          sessionId={sessionId}
          allowedHints={allowedHints}
          hintsUsed={hintsUsed}
          onHintUsed={() => setHintsUsed(prev => prev + 1)}
        />
      </div>
    </div>
  );
}
