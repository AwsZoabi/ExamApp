import { createQuestion } from '../../utils/exam';
import { Icon } from '../common/Icon';

export function QuestionEditor({ questions, onChange, errors = {} }) {
  const updateQuestion = (questionIndex, patch) => {
    onChange(
      questions.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question,
      ),
    );
  };

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const answers = [...questions[questionIndex].answers];
    answers[answerIndex] = value;
    updateQuestion(questionIndex, { answers });
  };

  const addAnswer = (questionIndex) => {
    updateQuestion(questionIndex, {
      answers: [...questions[questionIndex].answers, ''],
    });
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const question = questions[questionIndex];
    if (question.answers.length <= 2) return;
    const answers = question.answers.filter((_, index) => index !== answerIndex);
    let correctAnswerIndex = question.correctAnswerIndex;
    if (answerIndex === correctAnswerIndex) correctAnswerIndex = 0;
    else if (answerIndex < correctAnswerIndex) correctAnswerIndex -= 1;
    updateQuestion(questionIndex, { answers, correctAnswerIndex });
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length <= 1) return;
    onChange(questions.filter((_, index) => index !== questionIndex));
  };

  return (
    <section className="question-editor" aria-labelledby="questions-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Question builder</span>
          <h2 id="questions-heading">Questions & answer keys</h2>
          <p>Build clear multiple-choice questions and mark one correct answer.</p>
        </div>
        <span className="count-chip">{questions.length}</span>
      </div>

      {errors.questions && <p className="field-error" role="alert">{errors.questions}</p>}

      <div className="question-editor__list">
        {questions.map((question, questionIndex) => (
          <article className="question-builder" key={question.id}>
            <header className="question-builder__header">
              <div>
                <span className="question-number">{String(questionIndex + 1).padStart(2, '0')}</span>
                <div>
                  <strong>Question {questionIndex + 1}</strong>
                  <span>{question.answers.length} answer choices</span>
                </div>
              </div>
              <button
                aria-label={`Remove question ${questionIndex + 1}`}
                className="icon-button icon-button--danger"
                disabled={questions.length <= 1}
                onClick={() => removeQuestion(questionIndex)}
                type="button"
              >
                <Icon name="trash" size={17} />
              </button>
            </header>

            <div className="field-group">
              <label htmlFor={`question-${question.id}`}>Question text</label>
              <textarea
                aria-invalid={Boolean(errors[`question-${questionIndex}`])}
                id={`question-${question.id}`}
                onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
                placeholder="Write a focused, unambiguous question…"
                rows="2"
                value={question.text}
              />
              {errors[`question-${questionIndex}`] && (
                <span className="field-error">{errors[`question-${questionIndex}`]}</span>
              )}
            </div>

            <fieldset className="answers-fieldset">
              <legend>Answer choices <span>Select the correct answer</span></legend>
              <div className="answers-list">
                {question.answers.map((answer, answerIndex) => (
                  <div className="answer-editor" key={`${question.id}-${answerIndex}`}>
                    <label className="answer-selector">
                      <input
                        checked={question.correctAnswerIndex === answerIndex}
                        name={`correct-${question.id}`}
                        onChange={() => updateQuestion(questionIndex, { correctAnswerIndex: answerIndex })}
                        type="radio"
                      />
                      <span aria-hidden="true"><Icon name="check" size={14} /></span>
                      <span className="sr-only">Mark answer {answerIndex + 1} as correct</span>
                    </label>
                    <input
                      aria-label={`Answer ${answerIndex + 1} for question ${questionIndex + 1}`}
                      onChange={(event) => updateAnswer(questionIndex, answerIndex, event.target.value)}
                      placeholder={`Answer choice ${answerIndex + 1}`}
                      value={answer}
                    />
                    <button
                      aria-label={`Remove answer ${answerIndex + 1}`}
                      className="icon-button icon-button--subtle"
                      disabled={question.answers.length <= 2}
                      onClick={() => removeAnswer(questionIndex, answerIndex)}
                      type="button"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {(errors[`answers-${questionIndex}`] || errors[`correct-${questionIndex}`]) && (
                <span className="field-error">
                  {errors[`answers-${questionIndex}`] ?? errors[`correct-${questionIndex}`]}
                </span>
              )}
              <button className="text-button" onClick={() => addAnswer(questionIndex)} type="button">
                <Icon name="plus" size={15} /> Add answer choice
              </button>
            </fieldset>
          </article>
        ))}
      </div>

      <button
        className="add-question-button"
        onClick={() => onChange([...questions, createQuestion(questions.length)])}
        type="button"
      >
        <span><Icon name="plus" size={19} /></span>
        <strong>Add another question</strong>
        <small>Expand this assessment with a new multiple-choice item.</small>
      </button>
    </section>
  );
}
