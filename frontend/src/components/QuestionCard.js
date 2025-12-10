export default function QuestionCard({ question, onAnswer, hiddenOptions = [] }) {
    if (!question) return <div>Loading question...</div>;
  
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{question.question}</h2>
  
        {question.options.map((option, index) => {
          if (hiddenOptions.includes(index)) return null;
  
          return (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              style={{
                display: "block",
                margin: "10px 0",
                padding: 12,
                fontSize: 16
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }
  