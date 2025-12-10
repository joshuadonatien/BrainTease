import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMultiplayerSessionById, submitMultiplayerScore } from "../services/multiplayerService";
import { startGame } from "../services/questionService";
import QuestionCard from "../components/QuestionCard";
import Loader from "../components/Loader";

export default function MultiplayerGame() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [session, setSession] = useState(location.state?.session || null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startTime] = useState(Date.now());

  useEffect(() => {
    async function loadGame() {
      try {
        // Get session if not provided
        let sessionData = session;
        if (!sessionData) {
          sessionData = await getMultiplayerSessionById(sessionId);
          setSession(sessionData);
        }

        // Load questions using the session's board_seed and settings
        if (sessionData && !questions.length) {
          const gameData = await startGame(
            sessionData.difficulty,
            sessionData.total_questions,
            [],
            sessionData.board_seed
          );
          
          // Transform questions to match QuestionCard format
          const transformedQuestions = gameData.questions.map((q) => {
            const correctIndex = q.shuffled_answers.indexOf(q.correct_answer);
            return {
              question: q.question,
              options: q.shuffled_answers,
              answer: correctIndex,
              correct_answer: q.correct_answer,
            };
          });
          
          setQuestions(transformedQuestions);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || "Failed to load game");
        setLoading(false);
      }
    }

    if (session && !questions.length) {
      loadGame();
    } else if (!session) {
      loadGame();
    }
  }, [session, sessionId, questions.length]);

  async function handleAnswer(choiceIndex) {
    const currentQuestion = questions[currentIndex];
    const isCorrect = choiceIndex === currentQuestion.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;
    
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
    } else {
      // Game over - submit score
      await handleGameOver(isCorrect);
    }
  }

  async function handleGameOver(lastAnswerCorrect) {
    setGameOver(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = score + (lastAnswerCorrect ? 1 : 0);
    const finalCorrectCount = correctCount + (lastAnswerCorrect ? 1 : 0);

    try {
      // User ID comes from Firebase authentication token automatically
      const result = await submitMultiplayerScore(sessionId, {
        score: finalScore,
        correct_count: finalCorrectCount,
        time_taken_seconds: timeTaken,
      });

      // If game is finished (all players done), show results
      if (result.status === "finished") {
        navigate(`/multiplayer-results/${sessionId}`, {
          state: { session: result }
        });
      } else {
        // Other players still playing - wait for results
        navigate(`/multiplayer-waiting-results/${sessionId}`, {
          state: { session: result }
        });
      }
    } catch (err) {
      setError(err.message || "Failed to submit score");
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/lobby")}>Back to Lobby</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <h1>Game Over! 🎉</h1>
        <p>Submitting your score...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

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
            Question {currentIndex + 1} / {questions.length}
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
        />
      </div>
    </div>
  );
}

