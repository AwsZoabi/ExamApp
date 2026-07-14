import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Icon } from '../components/common/Icon';
import { ErrorState, LoadingState } from '../components/common/PageState';
import { ResultReview } from '../components/exam/ResultReview';
import { dataService } from '../services/dataService';
import { notifyService } from '../services/notifyService';
import { answeredCount } from '../utils/exam';
import { formatTimer } from '../utils/format';

export function TakeExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    let active = true;
    dataService
      .getExam(id)
      .then((loadedExam) => {
        if (!active) return;
        if (loadedExam.status !== 'open') throw new Error('This exam is not currently open.');
        if (!loadedExam.questions?.length) throw new Error('This exam does not contain any questions yet.');
        setExam(loadedExam);
        setRemainingSeconds(Number(loadedExam.durationMinutes) * 60);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!exam || result || remainingSeconds === null || remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam, remainingSeconds, result]);

  useEffect(() => {
    if (!exam || result || answeredCount(answers) === 0) return undefined;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [answers, exam, result]);

  const submit = useCallback(
    async (automatic = false) => {
      if (!exam || submittedRef.current) return;
      submittedRef.current = true;
      setConfirmOpen(false);
      setIsSubmitting(true);
      try {
        const durationSeconds = Math.max(
          0,
          Number(exam.durationMinutes) * 60 - Number(remainingSeconds ?? 0),
        );
        const submission = await dataService.submitExam(exam.id, { answers, durationSeconds });
        setResult({ ...submission, exam: submission.exam ?? exam, answers: submission.answers ?? answers });
        notifyService.success(
          automatic ? 'Time is up — your answers were submitted.' : 'Your exam was submitted successfully.',
        );
      } catch (submitError) {
        submittedRef.current = false;
        notifyService.error(submitError.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, exam, remainingSeconds],
  );

  useEffect(() => {
    if (exam && remainingSeconds === 0 && !result && !submittedRef.current) submit(true);
  }, [exam, remainingSeconds, result, submit]);

  const progress = useMemo(() => {
    if (!exam) return 0;
    return Math.round((answeredCount(answers) / exam.questions.length) * 100);
  }, [answers, exam]);

  if (isLoading) return <LoadingState label="Preparing your exam…" />;
  if (error) return <ErrorState message={error} title="Exam unavailable" />;
  if (result) return <div className="page-container"><ResultReview submission={result} /></div>;
  if (!exam) return null;

  const question = exam.questions[currentIndex];
  const answered = answeredCount(answers);
  const unanswered = exam.questions.length - answered;
  const timerTone = remainingSeconds <= 60 ? 'critical' : remainingSeconds <= 300 ? 'warning' : 'normal';

  return (
    <div className="take-exam-page">
      <header className="exam-session-header">
        <div>
          <Link className="icon-button icon-button--subtle" aria-label="Leave exam" to="/student"><Icon name="close" size={18} /></Link>
          <div><span>{exam.course}</span><h1>{exam.title}</h1></div>
        </div>
        <div className={`exam-timer exam-timer--${timerTone}`} aria-live={timerTone === 'critical' ? 'assertive' : 'off'}>
          <Icon name="clock" size={19} />
          <div><span>Time remaining</span><strong>{formatTimer(remainingSeconds)}</strong></div>
        </div>
      </header>

      <div className="exam-progress-bar" aria-label={`${progress}% of questions answered`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="exam-session-layout">
        <aside className="question-map" aria-label="Question navigation">
          <div className="question-map__heading"><span className="eyebrow">Progress</span><strong>{answered} of {exam.questions.length} answered</strong></div>
          <div className="question-map__grid">
            {exam.questions.map((item, index) => {
              const isAnswered = answers[item.id] !== undefined;
              return (
                <button
                  aria-current={index === currentIndex ? 'step' : undefined}
                  aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', unanswered'}`}
                  className={`${index === currentIndex ? 'is-current' : ''} ${isAnswered ? 'is-answered' : ''}`}
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                >
                  {isAnswered ? <Icon name="check" size={14} /> : index + 1}
                </button>
              );
            })}
          </div>
          <div className="question-map__legend"><span><i className="is-current" />Current</span><span><i className="is-answered" />Answered</span></div>
          <button className="button button--primary question-map__submit" disabled={isSubmitting} onClick={() => setConfirmOpen(true)} type="button"><Icon name="check" size={17} /> Submit exam</button>
        </aside>

        <section className="question-stage" aria-label="Current question">
          <article className="question-card">
            <header className="question-card__header">
              <span className="question-number">{String(currentIndex + 1).padStart(2, '0')}</span>
              <div><span>Question {currentIndex + 1} of {exam.questions.length}</span><h2>{question.text}</h2></div>
            </header>

            <fieldset className="answer-options">
              <legend className="sr-only">Choose one answer</legend>
              {question.answers.map((answer, answerIndex) => (
                <label className={Number(answers[question.id]) === answerIndex ? 'is-selected' : ''} key={`${question.id}-${answerIndex}`}>
                  <input
                    checked={Number(answers[question.id]) === answerIndex}
                    name={`answer-${question.id}`}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: answerIndex }))}
                    type="radio"
                    value={answerIndex}
                  />
                  <span className="answer-letter">{String.fromCharCode(65 + answerIndex)}</span>
                  <span>{answer}</span>
                  <span className="answer-check"><Icon name="check" size={15} /></span>
                </label>
              ))}
            </fieldset>

            <footer className="question-card__footer">
              <button className="button button--ghost" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} type="button"><Icon name="arrowLeft" size={17} /> Previous</button>
              {currentIndex < exam.questions.length - 1 ? (
                <button className="button button--primary" onClick={() => setCurrentIndex((index) => index + 1)} type="button">Next question <Icon name="arrowRight" size={17} /></button>
              ) : (
                <button className="button button--primary" onClick={() => setConfirmOpen(true)} type="button">Review & submit <Icon name="check" size={17} /></button>
              )}
            </footer>
          </article>
          <p className="keyboard-hint"><Icon name="info" size={15} /> Your progress is saved for this session. Submit before the timer reaches zero.</p>
        </section>
      </div>

      <ConfirmDialog
        cancelLabel="Keep reviewing"
        confirmLabel={isSubmitting ? 'Submitting…' : 'Submit exam'}
        description={unanswered > 0 ? `You still have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}. Unanswered questions count as incorrect.` : 'You answered every question. Once submitted, your answers cannot be changed.'}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => submit(false)}
        open={confirmOpen}
        title="Ready to submit?"
        tone="primary"
      />
    </div>
  );
}
