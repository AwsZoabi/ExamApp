import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { EmptyState, ErrorState, LoadingState, MetricCard, PageHeader } from '../components/common/PageState';
import { ExamCard } from '../components/exam/ExamCard';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { formatDate } from '../utils/format';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [overview, exams, submissions] = await Promise.all([
        dataService.getStudentDashboard(),
        dataService.getExams(),
        dataService.getMySubmissions(),
      ]);
      setDashboard({
        ...overview,
        availableExams: overview?.availableExams ?? exams,
        recentSubmissions: overview?.recentSubmissions ?? submissions,
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading && !dashboard) return <LoadingState label="Opening your learning workspace…" />;
  if (error && !dashboard) return <ErrorState message={error} onRetry={loadDashboard} />;

  const availableExams = dashboard?.availableExams ?? [];
  const submissions = dashboard?.recentSubmissions ?? [];
  const metrics = dashboard?.metrics ?? {};

  return (
    <div className="page-container">
      <PageHeader
        description="Choose an available assessment, stay on track, and learn from every result."
        eyebrow="Student workspace"
        title={`Good to see you, ${user.fullName.split(' ')[0]}`}
      />

      {error && <div className="inline-alert inline-alert--warning"><Icon name="warning" size={18} />{error}</div>}

      <section className="metrics-grid" aria-label="Learning metrics">
        <MetricCard detail="Ready when you are" icon="exam" label="Available" tone="violet" value={metrics.availableExams ?? availableExams.length} />
        <MetricCard detail="Recorded attempts" icon="check" label="Completed" tone="cyan" value={metrics.completedExams ?? submissions.length} />
        <MetricCard detail="Across your attempts" icon="chart" label="Average score" tone="green" value={`${metrics.averageScore ?? 0}%`} />
        <MetricCard detail="Successful outcomes" icon="trophy" label="Passed" tone="amber" value={metrics.passedExams ?? submissions.filter((item) => item.passed).length} />
      </section>

      <section>
        <div className="section-heading section-heading--outside">
          <div><span className="eyebrow">Ready to begin</span><h2>Available exams</h2><p>Take a breath, check the time limit, and start when you feel prepared.</p></div>
          <span className="count-chip">{availableExams.length}</span>
        </div>
        {availableExams.length === 0 ? (
          <div className="content-card"><EmptyState icon="book" title="You're all caught up" description="There are no open exams right now. Check back later for new assessments." /></div>
        ) : (
          <div className="exam-grid">
            {availableExams.map((exam) => <ExamCard actionTo={`/student/exams/${exam.id}/take`} exam={exam} key={exam.id} />)}
          </div>
        )}
      </section>

      <section className="content-card">
        <div className="section-heading"><div><span className="eyebrow">Your progress</span><h2>Submission history</h2><p>Review previous outcomes and celebrate the progress you've made.</p></div></div>
        {submissions.length === 0 ? (
          <EmptyState icon="chart" title="No completed exams yet" description="Your scores and detailed answer reviews will appear here after your first submission." />
        ) : (
          <div className="history-list">
            {submissions.map((submission) => (
              <article className="history-row" key={submission.id}>
                <span className={`history-row__score ${submission.passed ? 'is-passed' : 'is-failed'}`}>{submission.score}<small>%</small></span>
                <div className="history-row__title"><strong>{submission.examTitle ?? submission.exam?.title}</strong><span>{submission.course ?? submission.exam?.course} · {formatDate(submission.submittedAt)}</span></div>
                <span className={`outcome-label ${submission.passed ? 'outcome-label--passed' : 'outcome-label--failed'}`}><Icon name={submission.passed ? 'check' : 'close'} size={14} />{submission.passed ? 'Passed' : 'Not passed'}</span>
                <Link className="button button--ghost button--compact" to={`/student/results/${submission.id}`}>Review <Icon name="arrowRight" size={15} /></Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
