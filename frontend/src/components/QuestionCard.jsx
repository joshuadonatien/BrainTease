import React, { useState, useMemo } from "react";

export default function QuestionCard({ question, onAnswer }) {
  const [hiddenOption, setHiddenOption] = useState(null);

  // Generate multiple choice options for questions that only have a correct answer
  const options = useMemo(() => {
    console.log('🔍 QuestionCard options generation, question:', question);
    
    if (!question) {
      console.log('❌ No question provided');
      return [];
    }
    
    // If question already has options, use them
    if (question.options && Array.isArray(question.options)) {
      console.log('✅ Using existing options:', question.options);
      return question.options;
    }
    
    // Otherwise, create simple multiple choice with the correct answer and some dummy options
    const correctAnswer = question.answer;
    if (!correctAnswer) {
      console.log('❌ No correct answer found');
      return [];
    }
    
    console.log('🔧 Generating options for answer:', correctAnswer);
    const dummyOptions = generateDummyOptions(question.text || question.question || '', correctAnswer);
    console.log('🎯 Dummy options:', dummyOptions);
    
    // Shuffle the options so correct answer isn't always first
    const allOptions = [correctAnswer, ...dummyOptions];
    const shuffled = shuffleArray(allOptions);
    console.log('🔀 Final shuffled options:', shuffled);
    
    return shuffled;
  }, [question]);

  function generateDummyOptions(questionText, correctAnswer) {
    // Simple dummy option generation based on question type
    if (!questionText || !correctAnswer) return ['Option A', 'Option B', 'Option C'];
    
    const lower = questionText.toLowerCase();
    
    if (lower.includes('capital')) {
      return ['London', 'Berlin', 'Madrid'].filter(opt => opt !== correctAnswer).slice(0, 3);
    } else if (lower.includes('2+2') || lower.includes('math')) {
      return ['3', '5', '6'].filter(opt => opt !== correctAnswer).slice(0, 3);
    } else if (lower.includes('wrote') || lower.includes('author')) {
      return ['Charles Dickens', 'Mark Twain', 'Jane Austen'].filter(opt => opt !== correctAnswer).slice(0, 3);
    } else if (lower.includes('planet')) {
      return ['Saturn', 'Mars', 'Venus'].filter(opt => opt !== correctAnswer).slice(0, 3);
    } else if (lower.includes('year') || lower.includes('war')) {
      return ['1944', '1946', '1943'].filter(opt => opt !== correctAnswer).slice(0, 3);
    } else {
      // Generic options
      return ['Option A', 'Option B', 'Option C'].filter(opt => opt !== correctAnswer).slice(0, 3);
    }
  }

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function handleOptionClick(selectedOption) {
    // Pass the selected option text to the parent
    onAnswer(selectedOption);
  }

  if (!question) return null;

  return (
    <div style={cardStyle}>
      <h2 style={questionStyle}>{question.text || question.question}</h2>

      <div style={optionsGridStyle}>
        {options && options.length > 0 ? options.map((option, idx) => {
          if (idx === hiddenOption) return null;

          return (
            <button
              key={idx}
              style={optionButtonStyle}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={(e) => e.target.style.background = '#e3f2fd'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              {option}
            </button>
          );
        }) : (
          <div>No options available</div>
        )}
      </div>

      <button
        onClick={() => {
          if (options && options.length > 0) {
            setHiddenOption(Math.floor(Math.random() * options.length));
          }
        }}
        style={hintButtonStyle}
        disabled={!options || options.length === 0}
      >
        💡 Use Hint
      </button>
    </div>
  );
}

const cardStyle = {
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '12px',
  padding: '30px',
  margin: '20px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const questionStyle = {
  fontSize: '24px',
  marginBottom: '30px',
  color: '#333',
  lineHeight: '1.4'
};

const optionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  marginBottom: '30px'
};

const optionButtonStyle = {
  background: 'white',
  border: '2px solid #5b9491',
  borderRadius: '8px',
  padding: '15px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  color: '#333'
};

const hintButtonStyle = {
  background: '#ff9800',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold'
};
