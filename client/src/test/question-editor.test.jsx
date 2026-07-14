import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { QuestionEditor } from '../components/exam/QuestionEditor';
import { createQuestion } from '../utils/exam';

function Harness() {
  const [questions, setQuestions] = useState([createQuestion(0)]);
  return <QuestionEditor onChange={setQuestions} questions={questions} />;
}

describe('QuestionEditor', () => {
  it('adds answer choices and questions without losing the current question', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: /add answer choice/i }));
    expect(screen.getByRole('textbox', { name: /answer 3 for question 1/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add another question/i }));
    expect(screen.getByText('Question 2', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getAllByText(/answer choices/i).length).toBeGreaterThan(1);
  });
});
