import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examService } from '../services/examService';
import { notifyService } from '../services/notifyService';

function TakeExam({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const examData = await examService.getExamById(id);
        setExam(examData);
      } catch (error) {
        notifyService.error(error.message);
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id, navigate]);

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Object.keys(answers).length !== exam.questions.length) {
      notifyService.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const submitResult = await examService.submitExam(exam.id, user.id, answers);
      setResult(submitResult);
      notifyService.success(`Exam submitted. Score: ${submitResult.score}`);
    } catch (error) {
      notifyService.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Loading exam...</div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  if (result) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm">
          <div className="card-body text-center">
            <h1>Exam Submitted</h1>
            <p className="text-muted">{exam.title}</p>

            <div className="display-4 my-4">{result.score}</div>

            <p>
              Correct answers: {result.correctAnswers} / {result.totalQuestions}
            </p>

            <Link className="btn btn-primary" to="/student">
              Back to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1>{exam.title}</h1>
      <p className="text-muted">
        Course: {exam.course} | Duration: {exam.durationMinutes} minutes
      </p>

      <form onSubmit={handleSubmit}>
        {exam.questions.map((question, questionIndex) => (
          <div className="card mb-3 shadow-sm" key={question.id}>
            <div className="card-body">
              <h5>
                Question {questionIndex + 1}: {question.text}
              </h5>

              {question.answers.map((answer, answerIndex) => (
                <div className="form-check mt-2" key={answerIndex}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`question-${question.id}`}
                    id={`question-${question.id}-answer-${answerIndex}`}
                    checked={answers[question.id] === answerIndex}
                    onChange={() => handleAnswerChange(question.id, answerIndex)}
                  />

                  <label
                    className="form-check-label"
                    htmlFor={`question-${question.id}-answer-${answerIndex}`}
                  >
                    {answer}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="d-flex gap-2">
          <button className="btn btn-success" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>

          <Link className="btn btn-secondary" to="/student">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default TakeExam;