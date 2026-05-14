import React from 'react';

const QuestionView = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  message
}) => {
  if (!question) {
    return null;
  }

  return (
    <div>
      <div className="mb-3">
        <h5 className="mb-2">Question {questionNumber} of {totalQuestions}</h5>
        <p className="lead">{question.question}</p>
      </div>

      <div className="mb-4">
        {question.options.map((option, index) => (
          <div className="form-check mb-2" key={index}>
            <input
              className="form-check-input"
              type="radio"
              name={`question_${question.id}`}
              id={`question_${question.id}_option_${index}`}
              checked={selectedOption === index}
              onChange={() => onSelectOption(index)}
            />
            <label
              className="form-check-label"
              htmlFor={`question_${question.id}_option_${index}`}
            >
              {option}
            </label>
          </div>
        ))}
      </div>

      {message && <div className="alert alert-success py-2">{message}</div>}
    </div>
  );
};

export default QuestionView;
