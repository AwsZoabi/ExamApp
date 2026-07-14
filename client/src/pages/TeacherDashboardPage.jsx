import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Icon } from '../components/common/Icon';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from '../components/common/PageState';
import { dataService } from '../services/dataService';
import { notifyService } from '../services/notifyService';
import { formatDate, formatDateTime, pluralize } from '../utils/format';

export function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [overview, exams] = await Promise.all([
        dataService.getTeacherDashboard(),
        dataService.getExams(),
      ]);
      setDashboard({ ...overview, exams: overview?.exams ?? exams });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateStatus = async (exam, status) => {
    setBusyId(exam.id);
    try {
      await dataService.updateExam(exam.id, { ...exam, status });
      notifyService.success(
        status === 'open' ? 'Exam published and available to students.' : 'Exam closed successfully.',
      );
      await loadDashboard();
    } catch (updateError) {
      notifyService.error(updateError.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteExam = async () => {
    const exam = deleteTarget;
    setDeleteTarget(null);
    setBusyId(exam.id);
    try {
      await dataService.deleteExam(exam.id);
      notifyService.success(`“${exam.title}” was deleted.`);
      await loadDashboard();
    } catch (deleteError) {
      notifyService.error(deleteError.message);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading && !dashboard) return <LoadingState label="Preparing your teaching dashboard…" />;
  if (error && !dashboard) return <ErrorState message={error} onRetry={loadDashboard} />;

  const exams = dashboard?.exams ?? [];
  const submissions = dashboard?.recentSubmissions ?? [];
  const metrics = dashboard?.metrics ?? {};

  return (
    <div className="page-container">
      <PageHeader
        actions={
          <Link className="button button--primary" to="/teacher/exams/new">
            <Icon name="plus" size={17} /> Create exam
          </Link>
        }
        description="Shape thoughtful assessments, publish when ready, and turn every result into insight."
        eyebrow="Teacher workspace"
        title="Assessment overview"
      />

      {error && <div className="inline-alert inline-alert--warning"><Icon name="warning" size={18} />{error}</div>}

      <section className="metrics-grid" aria-label="Assessment metrics">
        <MetricCard detail={`${metrics.activeExams ?? 0} currently open`} icon="exam" label="Total exams" tone="violet" value={metrics.totalExams ?? exams.length} />
        <MetricCard detail="Across all assessments" icon="users" label="Submissions" tone="cyan" value={metrics.totalSubmissions ?? submissions.length} />
        <MetricCard detail={`${metrics.passRate ?? 0}% pass rate`} icon="chart" label="Average score" tone="green" value={`${metrics.averageScore ?? 0}%`} />
        <MetricCard detail="Enrolled learners" icon="book" label="Students" tone="amber" value={metrics.totalStudents ?? 0} />
      </section>

      <section className="content-card">
        <div className="section-heading section-heading--with-action">
          <div>
            <span className="eyebrow">Assessment library</span>
            <h2>Your exams</h2>
            <p>Draft, publish, close, edit, and inspect results from one place.</p>
          </div>
          <span className="count-chip">{pluralize(exams.length, 'exam')}</span>
        </div>

        {exams.length === 0 ? (
          <EmptyState
            action={<Link className="button button--primary" to="/teacher/exams/new"><Icon name="plus" size={17} /> Create first exam</Link>}
            description="Start with a draft, add questions, and publish when it feels right."
            title="No exams yet"
          />
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Assessment</th><th>Status</th><th>Questions</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div className="table-title">
                        <span className="table-title__icon"><Icon name="exam" size={18} /></span>
                        <div><strong>{exam.title}</strong><span>{exam.course}</span></div>
                      </div>
                    </td>
                    <td><StatusBadge status={exam.status} /></td>
                    <td>{exam.questions?.length ?? 0}</td>
                    <td>{formatDate(exam.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <Link aria-label={`View results for ${exam.title}`} className="icon-button icon-button--subtle" title="Results" to={`/teacher/exams/${exam.id}/results`}><Icon name="chart" size={17} /></Link>
                        <Link aria-label={`Edit ${exam.title}`} className="icon-button icon-button--subtle" title="Edit" to={`/teacher/exams/${exam.id}/edit`}><Icon name="edit" size={17} /></Link>
                        {exam.status === 'open' ? (
                          <button className="button button--soft button--compact" disabled={busyId === exam.id} onClick={() => updateStatus(exam, 'closed')} type="button">Close</button>
                        ) : (
                          <button className="button button--soft button--compact" disabled={busyId === exam.id} onClick={() => updateStatus(exam, 'open')} type="button">Publish</button>
                        )}
                        <button aria-label={`Delete ${exam.title}`} className="icon-button icon-button--danger" disabled={busyId === exam.id} onClick={() => setDeleteTarget(exam)} title="Delete" type="button"><Icon name="trash" size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Latest activity</span>
            <h2>Recent submissions</h2>
            <p>A quick pulse on how learners are performing.</p>
          </div>
        </div>
        {submissions.length === 0 ? (
          <EmptyState icon="chart" title="No submissions yet" description="Results will appear here as soon as students complete an exam." />
        ) : (
          <div className="submission-list">
            {submissions.map((submission) => (
              <article className="submission-row" key={submission.id}>
                <span className="avatar avatar--small">{submission.studentName?.slice(0, 1) ?? 'S'}</span>
                <div className="submission-row__person"><strong>{submission.studentName}</strong><span>{submission.examTitle}</span></div>
                <span className={`score-chip ${submission.passed ? 'score-chip--passed' : 'score-chip--failed'}`}>{submission.score}%</span>
                <time dateTime={submission.submittedAt}>{formatDateTime(submission.submittedAt)}</time>
              </article>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="Delete exam"
        description={deleteTarget ? `This permanently removes “${deleteTarget.title}” and its submissions. This action cannot be undone.` : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteExam}
        open={Boolean(deleteTarget)}
        title="Delete this exam?"
      />
    </div>
  );
}
