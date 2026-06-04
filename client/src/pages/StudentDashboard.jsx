import { Link } from 'react-router-dom';
import { mockDb } from '../api/mockDb';

function StudentDashboard({ user }) {
  const studentGrades = mockDb.grades
    .filter((grade) => grade.studentId === user.id)
    .map((grade) => {
      const exam = mockDb.exams.find((item) => item.id === grade.examId);
      return {
        ...grade,
        examTitle: exam ? exam.title : 'Unknown Exam',
        course: exam ? exam.course : 'Unknown Course',
      };
    });

  const openExams = mockDb.exams.filter((exam) => exam.status === 'Open');

  return (
    <div className="container py-4">
      <div className="mb-4 text-center">
        <h1>Student Dashboard</h1>
        <p className="text-muted">
          Welcome {user.fullName}. Here you can view available exams, submit exams, and see grades.
        </p>
      </div>

      <section className="mb-5">
        <h3 className="text-center mb-3">Available Exams</h3>

        <div className="row">
          {openExams.map((exam) => (
            <div className="col-md-4 mb-3" key={exam.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5>{exam.title}</h5>
                  <p className="text-muted">{exam.course}</p>
                  <p>{exam.description}</p>

                  <span className="badge bg-primary me-2">
                    {exam.durationMinutes} min
                  </span>
                  <span className="badge bg-success me-2">{exam.status}</span>

                  <div className="mt-3">
                    <Link className="btn btn-primary" to={`/student/exam/${exam.id}`}>
                      Start Exam
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-center mb-3">My Grades</h3>

        {studentGrades.length === 0 ? (
          <div className="alert alert-info text-center">No grades yet.</div>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Course</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.examTitle}</td>
                  <td>{grade.course}</td>
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

export default StudentDashboard;