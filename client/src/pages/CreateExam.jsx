import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { notifyService } from '../services/notifyService';

function CreateExam() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    durationMinutes: 45,
    status: 'Open',
    description: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await examService.createExam(formData);
      notifyService.success('Exam created successfully');
      navigate('/teacher');
    } catch (error) {
      notifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1>Create New Exam</h1>
      <p className="text-muted">Add a new exam to the mock database.</p>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Exam title</label>
              <input
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Course</label>
              <input
                className="form-control"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Duration minutes</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-success" disabled={loading}>
                {loading ? 'Saving...' : 'Create Exam'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/teacher')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;