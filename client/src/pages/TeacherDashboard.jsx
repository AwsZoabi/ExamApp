import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../services/examService';
import { notifyService } from '../services/notifyService';
import { mockDb } from '../api/mockDb';

function TeacherDashboard({ user }) {
  const [exams, setExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const examsData = await examService.getAllExams();
      const gradesData = await examService.getGradesSummary();

      setExams(examsData);
      setGrades(gradesData);
    } catch (error) {
      notifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this exam?');

    if (!confirmDelete) {
      return;
    }

    try {
      await examService.deleteExam(id);
      notifyService.success('Exam deleted successfully');
      loadData();
    } catch (error) {
      notifyService.error(error.message);
    }
  };

  const studentCount = mockDb.users.filter((item) => item.role === 'student').length;
  const openExamCount = exams.filter((item) => item.status === 'Open').length;

  if (loading) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Loading teacher dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="text-muted">
            Welcome {user.fullName}. Manage exams and view student results.
          </p>
        </div>

        <Link className="btn btn-success" to="/teacher/create">
          Create New Exam
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{exams.length}</h3>
              <p className="text-muted mb-0">Total Exams</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{openExamCount}</h3>
              <p className="text-muted mb-0">Open Exams</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{studentCount}</h3>
              <p className="text-muted mb-0">Students</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-5">
        <h3>Manage Exams</h3>

        <table className="table table-bordered table-striped align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Status</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.course}</td>
                <td>{exam.durationMinutes} min</td>
                <td>
                  <span
                    className={
                      exam.status === 'Open'
                        ? 'badge bg-success'
                        : 'badge bg-secondary'
                    }
                  >
                    {exam.status}
                  </span>
                </td>
                <td>
                  <Link
                    className="btn btn-primary btn-sm me-2"
                    to={`/teacher/edit/${exam.id}`}
                  >
                    Edit
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(exam.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Student Grades</h3>

        {grades.length === 0 ? (
          <div className="alert alert-info">No grades found.</div>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.studentName}</td>
                  <td>{grade.examTitle}</td>
                  <td>{grade.score}</td>
                  <td>{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default TeacherDashboard;