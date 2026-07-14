import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { EmptyState, ErrorState, LoadingState, MetricCard, PageHeader } from '../components/common/PageState';
import { dataService } from '../services/dataService';
import { formatDateTime, pluralize } from '../utils/format';

export function ExamResultsPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [loadedExam, loadedSubmissions] = await Promise.all([
        dataService.getExam(id),
        dataService.getExamSubmissions(id),
      ]);
      setExam(loadedExam);
      setSubmissions(loadedSubmissions ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const metrics = useMemo(() => {
    const count = submissions.length;
    const average = count ? Math.round(submissions.reduce((sum, item) => sum + Number(item.score), 0) / count) : 0;
    const passed = submissions.filter((item) => item.passed).length;
    const passRate = count ? Math.round((passed / count) * 100) : 0;
    const highest = count ? Math.max(...submissions.map((item) => Number(item.score))) : 0;
    return { count, average, passRate, highest, passed };
  }, [submissions]);

  if (isLoading) return <LoadingState label="Collecting exam results…" />;
  if (error) return <ErrorState message={error} onRetry={loadResults} />;

  return (
    <div className="page-container">
      <PageHeader
        actions={<><Link className="button button--ghost" to="/teacher"><Icon name="arrowLeft" size={17} /> Back</Link><Link className="button button--secondary" to={`/teacher/exams/${id}/edit`}><Icon name="edit" size={17} /> Edit exam</Link></>}
        description={`${exam.course} · ${pluralize(exam.questions?.length ?? 0, 'question')} · ${exam.passingScore}% passing score`}
        eyebrow="Results & insights"
        title={exam.title}
      />

      <section className="metrics-grid metrics-grid--results" aria-label="Result metrics">
        <MetricCard detail="Recorded attempts" icon="users" label="Submissions" tone="violet" value={metrics.count} />
        <MetricCard detail="Across all attempts" icon="chart" label="Average" tone="cyan" value={`${metrics.average}%`} />
        <MetricCard detail={`${pluralize(metrics.passed, 'student')} passed`} icon="check" label="Pass rate" tone="green" value={`${metrics.passRate}%`} />
        <MetricCard detail="Best performance" icon="trophy" label="Highest score" tone="amber" value={`${metrics.highest}%`} />
      </section>

      <section className="content-card">
        <div className="section-heading"><div><span className="eyebrow">Submission log</span><h2>Student results</h2><p>Review every attempt and its final score.</p></div></div>
        {submissions.length === 0 ? (
          <EmptyState icon="chart" title="No results yet" description="This exam has not received a student submission yet." />
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table data-table--results">
              <thead><tr><th>Student</th><th>Submitted</th><th>Correct</th><th>Outcome</th><th>Score</th></tr></thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td><div className="table-title"><span className="avatar avatar--small">{submission.studentName?.slice(0, 1) ?? 'S'}</span><div><strong>{submission.studentName}</strong><span>{submission.student?.email ?? 'Student account'}</span></div></div></td>
                    <td>{formatDateTime(submission.submittedAt)}</td>
                    <td>{submission.correctAnswers} / {submission.totalQuestions}</td>
                    <td><span className={`outcome-label ${submission.passed ? 'outcome-label--passed' : 'outcome-label--failed'}`}><Icon name={submission.passed ? 'check' : 'close'} size={14} />{submission.passed ? 'Passed' : 'Not passed'}</span></td>
                    <td><strong className="table-score">{submission.score}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
