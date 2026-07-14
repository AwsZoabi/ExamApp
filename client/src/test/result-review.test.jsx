import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultReview } from '../components/exam/ResultReview';

describe('ResultReview', () => {
  it('shows the outcome and identifies correct and selected answers', () => {
    render(
      <MemoryRouter>
        <ResultReview
          submission={{
            score: 50,
            passed: false,
            correctAnswers: 1,
            totalQuestions: 2,
            answers: { 1: 0, 2: 0 },
            exam: {
              title: 'Review Test',
              course: 'Testing',
              passingScore: 60,
              questions: [
                { id: 1, text: 'First?', answers: ['Yes', 'No'], correctAnswerIndex: 0 },
                { id: 2, text: 'Second?', answers: ['No', 'Yes'], correctAnswerIndex: 1 },
              ],
            },
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/keep building momentum/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^correct answer$/i)).toHaveLength(2);
    expect(screen.getByText(/your answer/i)).toBeInTheDocument();
  });
});
