import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { ErrorState, LoadingState, PageHeader } from '../components/common/PageState';
import { QuestionEditor } from '../components/exam/QuestionEditor';
import { dataService } from '../services/dataService';
import { notifyService } from '../services/notifyService';
import { createExamDraft, normalizeExamForForm, validateExam } from '../utils/exam';

export function ExamEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [exam, setExam] = useState(createExamDraft);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return undefined;
    let active = true;
    dataService
      .getExam(id)
      .then((loadedExam) => {
        if (active) setExam(normalizeExamForForm(loadedExam));
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setExam((current) => ({
      ...current,
      [name]: ['durationMinutes', 'passingScore'].includes(name) ? Number(value) : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const saveExam = async (statusOverride) => {
    const candidate = { ...exam, status: statusOverride ?? exam.status };
    const validation = validateExam(candidate);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      notifyService.error('Review the highlighted fields before saving.');
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) await dataService.updateExam(id, candidate);
      else await dataService.createExam(candidate);
      notifyService.success(
        candidate.status === 'open'
          ? 'Exam published and ready for students.'
          : `Exam ${isEditing ? 'updated' : 'saved as a draft'}.`,
      );
      navigate('/teacher');
    } catch (error) {
      notifyService.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveExam();
  };

  if (isLoading) return <LoadingState label="Loading the exam builder…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => navigate('/teacher')} title="Exam unavailable" />;

  return (
    <div className="page-container page-container--editor">
      <PageHeader
        actions={<Link className="button button--ghost" to="/teacher"><Icon name="arrowLeft" size={17} /> Back</Link>}
        description="Design the structure, answer choices, and scoring rules in one focused flow."
        eyebrow={isEditing ? 'Edit assessment' : 'New assessment'}
        title={isEditing ? 'Refine your exam' : 'Build a new exam'}
      />

      <form className="exam-form" onSubmit={handleSubmit}>
        <section className="content-card exam-details-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Foundation</span>
              <h2>Exam details</h2>
              <p>Set expectations before you write the questions.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group field-group--wide">
              <label htmlFor="title">Exam title</label>
              <input aria-invalid={Boolean(errors.title)} id="title" name="title" onChange={updateField} placeholder="e.g. React Foundations" value={exam.title} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="course">Course</label>
              <input aria-invalid={Boolean(errors.course)} id="course" name="course" onChange={updateField} placeholder="Course or module" value={exam.course} />
              {errors.course && <span className="field-error">{errors.course}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" onChange={updateField} value={exam.status}>
                <option value="draft">Draft — teacher only</option>
                <option value="open">Open — available to students</option>
                <option value="closed">Closed — results only</option>
              </select>
            </div>
            <div className="field-group field-group--wide">
              <label htmlFor="description">Description</label>
              <textarea aria-invalid={Boolean(errors.description)} id="description" name="description" onChange={updateField} placeholder="Tell students what this exam covers…" rows="3" value={exam.description} />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="durationMinutes">Duration</label>
              <div className="input-with-suffix"><input aria-invalid={Boolean(errors.durationMinutes)} id="durationMinutes" max="480" min="1" name="durationMinutes" onChange={updateField} type="number" value={exam.durationMinutes} /><span>minutes</span></div>
              {errors.durationMinutes && <span className="field-error">{errors.durationMinutes}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="passingScore">Passing score</label>
              <div className="input-with-suffix"><input aria-invalid={Boolean(errors.passingScore)} id="passingScore" max="100" min="0" name="passingScore" onChange={updateField} type="number" value={exam.passingScore} /><span>%</span></div>
              {errors.passingScore && <span className="field-error">{errors.passingScore}</span>}
            </div>
          </div>
        </section>

        <QuestionEditor
          errors={errors}
          onChange={(questions) => {
            setExam((current) => ({ ...current, questions }));
            setErrors((current) => ({ ...current, questions: undefined }));
          }}
          questions={exam.questions}
        />

        <div className="editor-actions">
          <div><Icon name="info" size={18} /><span><strong>{exam.questions.length} {exam.questions.length === 1 ? 'question' : 'questions'}</strong><small>Students see questions in this order.</small></span></div>
          <div className="editor-actions__buttons">
            <Link className="button button--ghost" to="/teacher">Cancel</Link>
            <button className="button button--secondary" disabled={isSaving} onClick={() => saveExam('draft')} type="button"><Icon name="save" size={17} /> Save draft</button>
            <button className="button button--primary" disabled={isSaving} type="submit">
              {isSaving ? <><span className="button-spinner" /> Saving…</> : <><Icon name={exam.status === 'open' ? 'play' : 'check'} size={17} /> {exam.status === 'open' ? 'Save & publish' : 'Save changes'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
