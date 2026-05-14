import React, { useState, useEffect } from 'react';
import { getAllExams, getExamStatistics, deleteExam } from '../api/examService';

export const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [examsData, statsData] = await Promise.all([
          getAllExams(),
          getExamStatistics()
        ]);
        setExams(examsData);
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      setDeletingId(examId);
      await deleteExam(examId);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (err) {
      setError(err.message || 'Failed to delete exam');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info" role="alert">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading exams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5">
      <div className="mb-5">
        <h1 className="mb-4">
          <i className="bi bi-person-workspace me-2"></i>Teacher Dashboard
        </h1>

        {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}

        {stats && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-white bg-primary">
                <div className="card-body">
                  <h5 className="card-title">Total Exams</h5>
                  <p className="card-text display-4">{stats.totalExams}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-success">
                <div className="card-body">
                  <h5 className="card-title">Total Attempts</h5>
                  <p className="card-text display-4">{stats.totalAttempts}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-warning">
                <div className="card-body">
                  <h5 className="card-title">Average Score</h5>
                  <p className="card-text display-4">{stats.averageScore}%</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-info">
                <div className="card-body">
                  <h5 className="card-title">Pass Rate</h5>
                  <p className="card-text display-4">{stats.passRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Available Exams</h2>
          <button className="btn btn-success">
            <i className="bi bi-plus-lg me-2"></i>Create New Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="alert alert-warning">No exams available. Create your first exam!</div>
        ) : (
          <div className="row">
            {exams.map((exam) => (
              <div key={exam.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">{exam.title}</h5>
                  </div>
                  <div className="card-body">
                    <p className="card-text text-muted">{exam.description}</p>
                    <div className="mb-2">
                      <small className="text-muted d-block">
                        <strong>Questions:</strong> {exam.totalQuestions}
                      </small>
                      <small className="text-muted d-block">
                        <strong>Duration:</strong> {exam.duration} minutes
                      </small>
                      <small className="text-muted d-block">
                        <strong>Passing Score:</strong> {exam.passingScore}%
                      </small>
                      <small className="text-muted d-block">
                        <strong>Created:</strong> {exam.createdDate}
                      </small>
                    </div>
                  </div>
                  <div className="card-footer bg-light">
                    <button className="btn btn-sm btn-primary me-2">
                      <i className="bi bi-eye me-1"></i>View
                    </button>
                    <button className="btn btn-sm btn-warning me-2">
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteExam(exam.id)}
                      disabled={deletingId === exam.id}
                    >
                      {deletingId === exam.id ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-trash me-1"></i>Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
