import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamResultsPage } from '../pages/ExamResultsPage';
import { dataService } from '../services/dataService';

vi.mock('../services/dataService', () => ({
  dataService: {
    getExam: vi.fn(),
    getExamSubmissions: vi.fn(),
  },
}));

describe('ExamResultsPage', () => {
  beforeEach(() => {
    dataService.getExam.mockResolvedValue({
      id: 104,
      title: 'Release Verification Exam',
      course: 'Quality Assurance',
      passingScore: 60,
      questions: [{ id: 1 }],
    });
    dataService.getExamSubmissions.mockResolvedValue([
      {
        id: 4,
        studentName: 'Student Demo',
        correctAnswers: 1,
        totalQuestions: 1,
        passed: true,
        score: 100,
        submittedAt: '2026-07-13T16:00:00.000Z',
      },
    ]);
  });

  it('uses correct singular labels for one question and one passing student', async () => {
    render(
      <MemoryRouter initialEntries={['/teacher/exams/104/results']}>
        <Routes>
          <Route path="/teacher/exams/:id/results" element={<ExamResultsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Release Verification Exam' })).toBeInTheDocument();
    expect(screen.getByText(/Quality Assurance.*1 question.*60% passing score/)).toBeInTheDocument();
    expect(screen.getByText('1 student passed')).toBeInTheDocument();
  });
});
