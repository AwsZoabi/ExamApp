import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/common/PageState';
import { ResultReview } from '../components/exam/ResultReview';
import { dataService } from '../services/dataService';

export function SubmissionResultPage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadSubmission = async () => {
      try {
        const history = await dataService.getMySubmissions();
        const found = history.find((item) => String(item.id) === String(submissionId));
        if (!found) throw new Error('This result could not be found.');
        let exam = found.exam;
        if (!exam && found.examId) exam = await dataService.getExam(found.examId);
        if (active) setSubmission({ ...found, exam });
      } catch (loadError) {
        if (active) setError(loadError.message);
      }
    };
    loadSubmission();
    return () => {
      active = false;
    };
  }, [submissionId]);

  if (error) return <ErrorState message={error} title="Result unavailable" />;
  if (!submission) return <LoadingState label="Loading your answer review…" />;
  return <div className="page-container"><ResultReview submission={submission} /></div>;
}
