import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { mockService } from '../services/mockService';
import { storageService } from '../services/storageService';

describe('authentication and role routing', () => {
  beforeEach(() => mockService.resetForTests());

  it('redirects a signed-out visitor from a protected page to login', async () => {
    render(<MemoryRouter initialEntries={['/teacher']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /sign in to your workspace/i })).toBeInTheDocument();
  });

  it('signs in with the teacher demo and opens the teacher dashboard', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /teacher demo/i }));
    await user.click(screen.getByRole('button', { name: /^sign in/i }));

    expect(await screen.findByRole('heading', { name: /assessment overview/i })).toBeInTheDocument();
    expect(screen.getByText(/your exams/i)).toBeInTheDocument();
  });

  it('keeps a student out of teacher routes', async () => {
    const session = await mockService.login({
      email: 'student@examapp.local',
      password: '123456',
    });
    storageService.saveSession(session);

    render(<MemoryRouter initialEntries={['/teacher']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /good to see you/i })).toBeInTheDocument();
  });
});
