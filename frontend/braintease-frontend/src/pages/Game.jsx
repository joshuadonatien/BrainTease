
// import { useEffect, useState } from "react";
// import { useGame } from "../context/GameContext";
// import { fetchQuestionsFromClueBase } from "../services/triviaApi";

// export default function Game() {
//   const { difficulty, questions, setQuestions, currentIndex, setCurrentIndex } = useGame();
//   const [loading, setLoading] = useState(true);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [showResult, setShowResult] = useState(false);

//   useEffect(() => {
//     async function loadQuestions() {
//       // Only load if we don't have questions yet
//       if (questions.length > 0) {
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log("Fetching questions...");
//         const rawQuestions = await fetchQuestionsFromClueBase(10);
//         console.log("Raw questions:", rawQuestions);

//         if (!rawQuestions || rawQuestions.length === 0) {
//           console.error("No questions received");
//           return;
//         }

//         // Map to your preferred format
//         const mapped = rawQuestions.map((q) => ({
//           question: q.clue || q.question,
//           answer: q.response || q.answer,
//           category: q.category?.title || q.category || "General",
//           incorrectAnswers: q.incorrect_answers || []
//         }));

//         console.log("Mapped questions:", mapped);
//         setQuestions(mapped);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error loading questions:", error);
//         setLoading(false);
//       }
//     }

//     if (difficulty) {
//       loadQuestions();
//     }
//   }, [difficulty, questions.length, setQuestions]);

//   // Shuffle answers and combine correct + incorrect
//   function getShuffledAnswers(question) {
//     const allAnswers = [...question.incorrectAnswers, question.answer];
//     return allAnswers.sort(() => Math.random() - 0.5);
//   }

//   function handleAnswerClick(answer) {
//     setSelectedAnswer(answer);
//     setShowResult(true);
//   }

//   function handleNextQuestion() {
//     setSelectedAnswer(null);
//     setShowResult(false);
//     setCurrentIndex(currentIndex + 1);
//   }

//   if (!difficulty) return <p>Select a difficulty first!</p>;
//   if (loading) return <p>Loading questions...</p>;
//   if (questions.length === 0) return <p>No questions available. Please try again.</p>;

//   const currentQuestion = questions[currentIndex];
//   const shuffledAnswers = getShuffledAnswers(currentQuestion);
//   const isCorrect = selectedAnswer === currentQuestion.answer;

//   return (
//     <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
//       <div style={{ marginBottom: '20px' }}>
//         <h2>Difficulty: {difficulty.toUpperCase()}</h2>
//         <p>Question {currentIndex + 1} of {questions.length}</p>
//       </div>

//       <div style={{ marginBottom: '30px' }}>
//         <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
//           <strong>Category:</strong> {currentQuestion.category}
//         </p>
//         <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
//           {currentQuestion.question}
//         </h3>
//       </div>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         {shuffledAnswers.map((answer, index) => {
//           let buttonStyle = {
//             padding: '15px',
//             fontSize: '16px',
//             border: '2px solid #ddd',
//             borderRadius: '8px',
//             cursor: showResult ? 'default' : 'pointer',
//             backgroundColor: '#fff',
//             textAlign: 'left',
//             transition: 'all 0.2s'
//           };

//           // Show correct/incorrect colors after answer is selected
//           if (showResult) {
//             if (answer === currentQuestion.answer) {
//               buttonStyle.backgroundColor = '#4CAF50';
//               buttonStyle.color = 'white';
//               buttonStyle.borderColor = '#4CAF50';
//             } else if (answer === selectedAnswer) {
//               buttonStyle.backgroundColor = '#f44336';
//               buttonStyle.color = 'white';
//               buttonStyle.borderColor = '#f44336';
//             }
//           }

//           return (
//             <button
//               key={index}
//               onClick={() => !showResult && handleAnswerClick(answer)}
//               style={buttonStyle}
//               disabled={showResult}
//               onMouseEnter={(e) => !showResult && (e.target.style.backgroundColor = '#f0f0f0')}
//               onMouseLeave={(e) => !showResult && (e.target.style.backgroundColor = '#fff')}
//             >
//               {answer}
//             </button>
//           );
//         })}
//       </div>

//       {showResult && (
//         <div style={{ marginTop: '30px', textAlign: 'center' }}>
//           <p style={{ 
//             fontSize: '18px', 
//             fontWeight: 'bold',
//             color: isCorrect ? '#4CAF50' : '#f44336',
//             marginBottom: '15px'
//           }}>
//             {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
//           </p>
          
//           {currentIndex < questions.length - 1 ? (
//             <button
//               onClick={handleNextQuestion}
//               style={{
//                 padding: '12px 30px',
//                 fontSize: '16px',
//                 backgroundColor: '#2196F3',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 cursor: 'pointer'
//               }}
//             >
//               Next Question →
//             </button>
//           ) : (
//             <p style={{ fontSize: '16px', marginTop: '20px' }}>
//               Game finished! (Score tracking coming next)
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { fetchQuestionsFromClueBase } from "../services/triviaApi";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const { 
    difficulty, 
    questions, 
    setQuestions, 
    currentIndex, 
    setCurrentIndex,
    score,
    setScore,
    gameFinished,
    setGameFinished
  } = useGame();
  
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadQuestions() {
      // Only load if we don't have questions yet
      if (questions.length > 0) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching questions...");
        const rawQuestions = await fetchQuestionsFromClueBase(10);
        console.log("Raw questions:", rawQuestions);

        if (!rawQuestions || rawQuestions.length === 0) {
          console.error("No questions received");
          return;
        }

        // Map to your preferred format
        const mapped = rawQuestions.map((q) => ({
          question: q.clue || q.question,
          answer: q.response || q.answer,
          category: q.category?.title || q.category || "General",
          incorrectAnswers: q.incorrect_answers || []
        }));

        console.log("Mapped questions:", mapped);
        setQuestions(mapped);
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    }

    if (difficulty) {
      loadQuestions();
    }
  }, [difficulty, questions.length, setQuestions]);

  // Shuffle answers and combine correct + incorrect
  function getShuffledAnswers(question) {
    const allAnswers = [...question.incorrectAnswers, question.answer];
    return allAnswers.sort(() => Math.random() - 0.5);
  }

  function handleAnswerClick(answer) {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // Update score if correct
    if (answer === questions[currentIndex].answer) {
      setScore(score + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Game is finished
      setGameFinished(true);
    }
  }

  function handlePlayAgain() {
    setCurrentIndex(0);
    setScore(0);
    setQuestions([]);
    setGameFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
    navigate('/');
  }

  if (!difficulty) return <p>Select a difficulty first!</p>;
  if (loading) return <p>Loading questions...</p>;
  if (questions.length === 0) return <p>No questions available. Please try again.</p>;

  // Show final results screen
  if (gameFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#2196F3' }}>
          Game Over! 🎉
        </h1>
        
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Your Score: {score} / {questions.length}
          </p>
          <p style={{ fontSize: '18px', color: '#666' }}>
            {percentage}% Correct
          </p>
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            {percentage >= 80 ? '🏆 Excellent!' : 
             percentage >= 60 ? '👍 Good Job!' : 
             percentage >= 40 ? '👌 Not Bad!' : 
             '💪 Keep Practicing!'}
          </p>
          <p style={{ color: '#666' }}>
            Difficulty: {difficulty.toUpperCase()}
          </p>
        </div>

        <button
          onClick={handlePlayAgain}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const shuffledAnswers = getShuffledAnswers(currentQuestion);
  const isCorrect = selectedAnswer === currentQuestion.answer;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Score Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Difficulty: {difficulty.toUpperCase()}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#2196F3'
          }}>
            Score: {score}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            {Math.round((score / questions.length) * 100)}% Correct
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
          <strong>Category:</strong> {currentQuestion.category}
        </p>
        <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
          {currentQuestion.question}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shuffledAnswers.map((answer, index) => {
          let buttonStyle = {
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: showResult ? 'default' : 'pointer',
            backgroundColor: '#fff',
            textAlign: 'left',
            transition: 'all 0.2s'
          };

          // Show correct/incorrect colors after answer is selected
          if (showResult) {
            if (answer === currentQuestion.answer) {
              buttonStyle.backgroundColor = '#4CAF50';
              buttonStyle.color = 'white';
              buttonStyle.borderColor = '#4CAF50';
            } else if (answer === selectedAnswer) {
              buttonStyle.backgroundColor = '#f44336';
              buttonStyle.color = 'white';
              buttonStyle.borderColor = '#f44336';
            }
          }

          return (
            <button
              key={index}
              onClick={() => !showResult && handleAnswerClick(answer)}
              style={buttonStyle}
              disabled={showResult}
              onMouseEnter={(e) => !showResult && (e.target.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => !showResult && (e.target.style.backgroundColor = '#fff')}
            >
              {answer}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: isCorrect ? '#4CAF50' : '#f44336',
            marginBottom: '15px'
          }}>
            {isCorrect ? '✓ Correct! +1 Point' : '✗ Incorrect! +0 Points'}
          </p>
          
          <button
            onClick={handleNextQuestion}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  );
}