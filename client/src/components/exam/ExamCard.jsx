import { Link } from 'react-router-dom';
import { formatDuration, pluralize } from '../../utils/format';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/PageState';

export function ExamCard({ exam, actionLabel = 'Start exam', actionTo }) {
  return (
    <article className="exam-card">
      <div className="exam-card__topline">
        <span className="course-label">{exam.course}</span>
        <StatusBadge status={exam.status} />
      </div>
      <div className="exam-card__content">
        <h3>{exam.title}</h3>
        <p>{exam.description}</p>
      </div>
      <dl className="exam-card__meta">
        <div><Icon name="clock" size={17} /><dt>Time</dt><dd>{formatDuration(exam.durationMinutes)}</dd></div>
        <div><Icon name="exam" size={17} /><dt>Questions</dt><dd>{exam.questions?.length ?? 0}</dd></div>
        <div><Icon name="trophy" size={17} /><dt>Pass</dt><dd>{exam.passingScore}%</dd></div>
      </dl>
      <div className="exam-card__footer">
        <span>{pluralize(exam.questions?.length ?? 0, 'question')}</span>
        <Link className="button button--primary button--compact" to={actionTo}>
          <Icon name="play" size={16} /> {actionLabel}
        </Link>
      </div>
    </article>
  );
}
