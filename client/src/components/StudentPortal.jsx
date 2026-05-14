import React, { useState } from 'react';
import { getExamById, submitExamAnswers } from '../api/examService';

export const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [currentExam, setCurrentExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [studentName, setStudentName] = useState('');

  const handleStartExam = async () => {
    if (!examId.trim()) {
      setError('Please enter an exam ID');
      return;
    }

    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const exam = await getExamById(examId);
      setCurrentExam(exam);
      setAnswers({});
      setSubmitted(false);
      setSubmittedResult(null);
    } catch (err) {
      setError(err.message || 'Failed to load exam');
      setCurrentExam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitExam = async () => {
    if (Object.keys(answers).length !== currentExam.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const answerArray = currentExam.questions.map((_, index) => answers[index]);

      const result = await submitExamAnswers(examId, studentName, answerArray);
      setSubmittedResult(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit exam');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setExamId('');
    setStudentName('');
    setCurrentExam(null);
    setAnswers({});
    setSubmitted(false);
    setSubmittedResult(null);
    setError(null);
  };

  if (submitted && submittedResult) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className={`card border-${submittedResult.scoreRecord.status === 'Passed' ? 'success' : 'danger'}`}>
              <div
                className={`card-header text-white bg-${submittedResult.scoreRecord.status === 'Passed' ? 'success' : 'danger'}`}
              >
                <h3 className="card-title mb-0">
                  {submittedResult.scoreRecord.status === 'Passed' ? (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Exam Passed!
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2"></i>Exam Failed
                    </>
                  )}
                </h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h5>Result Summary</h5>
                  <p className="mb-2">
                    <strong>Score:</strong>
                    <span className="badge bg-primary ms-2">{submittedResult.scoreRecord.score}%</span>
                  </p>
                  <p className="mb-2">
                    <strong>Correct Answers:</strong> {submittedResult.scoreRecord.correctAnswers} /{' '}
                    {submittedResult.scoreRecord.totalQuestions}
                  </p>
                  <p className="mb-2">
                    <strong>Passing Score:</strong> {currentExam.passingScore}%
                  </p>
                  <p className="text-muted">
                    <small>{submittedResult.message}</small>
                  </p>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary w-100" onClick={handleReset}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentExam) {
    return (
      <div className="container mt-5">
        <div className="row mb-4">
          <div className="col-md-8">
            <h2>{currentExam.title}</h2>
            <p className="text-muted">{currentExam.description}</p>
          </div>
          <div className="col-md-4 text-end">
            <div className="card bg-light">
              <div className="card-body">
                <p className="mb-1">
                  <strong>Student:</strong> {studentName}
                </p>
                <p className="mb-1">
                  <strong>Duration:</strong> {currentExam.duration} min
                </p>
                <p className="mb-0">
                  <strong>Total Questions:</strong> {currentExam.totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}

        <div className="card shadow-lg">
          <div className="card-body">
            {currentExam.questions.map((question, index) => (
              <div key={question.id} className="mb-4 pb-4 border-bottom">
                <div className="mb-3">
                  <h5>
                    Question {index + 1} of {currentExam.questions.length}
                  </h5>
                  <p className="lead">{question.question}</p>
                  <small className={`badge bg-${question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'}`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} Difficulty
                  </small>
                </div>

                <div className="options">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question_${question.id}`}
                        id={`question_${question.id}_option_${optionIndex}`}
                        value={optionIndex}
                        checked={answers[index] === optionIndex}
                        onChange={() => handleAnswerChange(index, optionIndex)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`question_${question.id}_option_${optionIndex}`}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2 mt-4 mb-4">
          <button
            className="btn btn-success btn-lg flex-grow-1"
            onClick={handleSubmitExam}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>Submit Exam
              </>
            )}
          </button>
          <button className="btn btn-outline-secondary btn-lg" onClick={handleReset} disabled={loading}>
            <i className="bi bi-x-lg me-2"></i>Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-header bg-success text-white">
              <h2 className="card-title mb-0">
                <i className="bi bi-person-check me-2"></i>Student Portal
              </h2>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Enter your details and exam ID to start taking the exam.
              </p>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                handleStartExam();
              }}>
                <div className="mb-3">
                  <label htmlFor="studentName" className="form-label">
                    <strong>Your Name</strong>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="studentName"
                    placeholder="Enter your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="examId" className="form-label">
                    <strong>Exam ID</strong>
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    id="examId"
                    placeholder="Enter Exam ID to start"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    required
                  />
                  <small className="text-muted d-block mt-2">
                    Available Exam IDs: 1 (JavaScript Fundamentals), 2 (React Basics), 3 (CSS and Styling)
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Starting Exam...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-fill me-2"></i>Start Exam
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-3 p-3 bg-light border rounded">
            <h6 className="mb-2">
              <i className="bi bi-info-circle me-2"></i>Test Credentials
            </h6>
            <small className="text-muted">
              <p className="mb-1">Try these exam IDs:</p>
              <ul className="mb-0">
                <li>Exam ID: <strong>1</strong> - JavaScript Fundamentals</li>
                <li>Exam ID: <strong>2</strong> - React Basics</li>
                <li>Exam ID: <strong>3</strong> - CSS and Styling</li>
              </ul>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
