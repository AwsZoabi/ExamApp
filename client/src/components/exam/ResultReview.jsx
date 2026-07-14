import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

function answerFor(submission, question) {
  return submission.answers?.[String(question.id)] ?? submission.answers?.[question.id];
}

export function ResultReview({ submission }) {
  const exam = submission.exam;
  const score = Number(submission.score) || 0;
  const passed = Boolean(submission.passed);

  return (
    <div className="result-view">
      <section className={`result-hero ${passed ? 'result-hero--passed' : 'result-hero--failed'}`}>
        <div className="result-hero__content">
          <span className="eyebrow">Assessment complete</span>
          <h1>{passed ? 'Excellent work.' : 'Keep building momentum.'}</h1>
          <p>
            {passed
              ? `You passed ${exam?.title ?? 'the exam'} and demonstrated a strong grasp of the material.`
              : `You did not reach the ${exam?.passingScore ?? 60}% passing score this time. Review the answers below and try again.`}
          </p>
          <div className="result-hero__actions">
            <Link className="button button--primary" to="/student">
              <Icon name="arrowLeft" size={17} /> Back to workspace
            </Link>
          </div>
        </div>
        <div className="score-orbit" aria-label={`Score ${score} percent`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" />
            <circle
              className="score-orbit__value"
              cx="60"
              cy="60"
              pathLength="100"
              r="52"
              strokeDasharray={`${score} 100`}
            />
          </svg>
          <strong>{score}<span>%</span></strong>
          <small>{passed ? 'Passed' : 'Not passed'}</small>
        </div>
      </section>

      <section className="result-summary" aria-label="Result summary">
        <div><span>Correct answers</span><strong>{submission.correctAnswers} / {submission.totalQuestions}</strong></div>
        <div><span>Passing score</span><strong>{exam?.passingScore ?? 60}%</strong></div>
        <div><span>Course</span><strong>{exam?.course ?? '—'}</strong></div>
      </section>

      {exam?.questions?.length > 0 && (
        <section className="answer-review">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Answer review</span>
              <h2>Understand every response</h2>
              <p>Correct answers are highlighted so you know where to focus next.</p>
            </div>
          </div>

          <div className="answer-review__list">
            {exam.questions.map((question, questionIndex) => {
              const selectedIndex = Number(answerFor(submission, question));
              const isCorrect = selectedIndex === Number(question.correctAnswerIndex);
              return (
                <article className="review-question" key={question.id}>
                  <header>
                    <span className={`review-question__status ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                      <Icon name={isCorrect ? 'check' : 'close'} size={16} />
                    </span>
                    <div>
                      <small>Question {questionIndex + 1}</small>
                      <h3>{question.text}</h3>
                    </div>
                  </header>
                  <div className="review-options">
                    {question.answers.map((answer, answerIndex) => {
                      const correct = answerIndex === Number(question.correctAnswerIndex);
                      const selected = answerIndex === selectedIndex;
                      return (
                        <div
                          className={`review-option ${correct ? 'review-option--correct' : ''} ${selected && !correct ? 'review-option--wrong' : ''}`}
                          key={`${question.id}-${answerIndex}`}
                        >
                          <span>{String.fromCharCode(65 + answerIndex)}</span>
                          <p>{answer}</p>
                          {correct && <small>Correct answer</small>}
                          {selected && !correct && <small>Your answer</small>}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
