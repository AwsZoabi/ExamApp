# ExamApp User Guide

This guide explains the complete teacher and student experience, the two client
data modes, and a short demonstration flow for assessment or recording.

## Open the application

With the complete Docker stack running, open:

- Application: [http://localhost:8080](http://localhost:8080)
- API documentation: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

For host development, the Vite client runs at
[http://localhost:5173](http://localhost:5173).

## Demo accounts

The seeded accounts are intended only for local demonstrations:

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `teacher@examapp.local` | `123456` |
| Student | `student@examapp.local` | `123456` |

The login page provides **Teacher demo** and **Student demo** shortcuts that
fill the appropriate credentials. Select a shortcut, then choose **Sign in**.

> The demo password is deliberately simple. Real deployments must use unique
> credentials and a production JWT secret.

## Teacher workflow

### 1. Open the teacher workspace

Sign in with the teacher demo account. The overview presents:

- total and currently open exams;
- submission count;
- average score and pass rate;
- enrolled-student count;
- recent student activity.

The assessment library shows each exam's lifecycle state:

- **Draft** — visible to teachers but not available to students;
- **Open** — published and available from the student workspace;
- **Closed** — unavailable for new attempts while results remain accessible.

### 2. Create an exam

Choose **Create exam**, then complete the assessment details:

1. Enter a title, course, and concise description.
2. Set the duration in minutes and the required passing score.
3. Choose the initial lifecycle status.
4. Write the first question.
5. Add at least two answer choices.
6. Select the check control beside the correct answer.
7. Use **Add answer choice** or **Add another question** as needed.

Question and answer controls are dynamic. A question can be removed as long as
at least one remains; an answer can be removed as long as two choices remain.

Choose **Save draft** to continue later, or set the status to **Open** and choose
**Save & publish** to make the exam available immediately.

### 3. Manage an exam

From the assessment library:

- choose the pencil control to edit details, questions, or scoring rules;
- choose **Publish** to open a draft or closed exam;
- choose **Close** to stop new attempts;
- choose the chart control to inspect submissions and performance metrics;
- choose the trash control to delete an exam after confirming the permanent
  removal of the exam and its submissions.

### 4. Review results

The results page reports submission count, average score, pass rate, and highest
score. The submission table includes the student, completion time, number of
correct answers, pass/fail outcome, and final score.

In API mode, scoring and authorization are enforced by the server. A teacher can
manage only the resources allowed by the backend role and ownership rules.

## Student workflow

### 1. Open the student workspace

Sign in with the student demo account. The dashboard shows:

- open exams available to take;
- completed-attempt count;
- average score;
- number of passed attempts;
- submission history with detailed-review links.

Each available-exam card identifies its course, time limit, question count, and
passing score.

### 2. Take an exam

Choose **Start exam** on an open assessment.

- The timer begins when the exam opens.
- The progress bar reflects answered questions.
- The question map shows the current and completed questions.
- **Previous** and **Next question** move through the assessment without losing
  selected answers.
- Any question number in the map can be selected directly.

Choose one answer for each question. When ready, choose **Review & submit** or
**Submit exam**. The confirmation dialog identifies any unanswered questions;
unanswered questions are scored as incorrect.

When the timer reaches zero, the current answers are submitted automatically.
Closing or refreshing an active attempt triggers a browser warning when answers
have already been selected.

### 3. Understand the result

After submission, ExamApp displays:

- final percentage and pass/fail outcome;
- correct-answer count;
- required passing score;
- every question and answer choice;
- the correct answer and, when different, the student's selected answer.

Return to **My workspace** to review the attempt again from submission history.

## Registration

The registration screen accepts a name, email, password, and workspace role.
In API mode, teacher self-registration is controlled by the server setting
`ALLOW_TEACHER_REGISTRATION`; a deployment may permit only student registration.
The seeded teacher account remains available for demonstrations.

## API and mock modes

The React client uses the same service interface in both modes.

### API mode

Use API mode for the complete full-stack submission:

```env
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:4000/api
```

The client sends authenticated requests with a bearer token. Express performs
validation, authorization, persistence, and scoring through the configured
PostgreSQL or JSON repository.

The production client image is built with `VITE_API_URL=/api`. Nginx proxies
that path to the Compose service at `http://server:4000/api/`.

### Mock mode

Use mock mode for a self-contained client demonstration:

```env
VITE_DATA_SOURCE=mock
```

Mock mode supports the same login, exam, dashboard, and submission workflows in
the browser. Changes are stored in browser `localStorage` and survive a normal
page refresh. To restore the original demo data, clear the site's storage in
browser developer tools.

Mock mode is a UI demonstration only. It does not provide server-side security
or multi-user persistence and should not be presented as a production backend.

## Accessibility and mobile use

ExamApp is designed for keyboard, touch, and responsive use:

- a skip link moves keyboard focus directly to the main content;
- interactive controls have visible focus indicators and accessible names;
- forms use explicit labels, error messages, semantic fieldsets, and status
  announcements;
- dialogs support the Escape key and identify their title and description;
- the exam timer announces the critical final minute;
- reduced-motion preferences minimize decorative animation;
- the desktop sidebar becomes a dismissible mobile navigation drawer;
- exam cards, metrics, forms, question controls, and result views reflow for
  narrow screens;
- wide result tables remain horizontally scrollable on small displays.

For the clearest timed-exam experience on a phone, use portrait orientation and
keep the browser tab active.

## Short demonstration script

Target duration: approximately **4 minutes**.

### 0:00–0:30 — Start and introduce

1. Show `docker compose ps` with the client, server, and PostgreSQL services
   healthy.
2. Open `http://localhost:8080`.
3. Explain that the React client uses the Express API and PostgreSQL/JSONB.

### 0:30–1:45 — Teacher journey

1. Select **Teacher demo** and sign in.
2. Point out the dashboard metrics and exam lifecycle badges.
3. Create an exam named `Demo Delivery Check` in course `Full-Stack Project`.
4. Set a short duration and add two questions with at least two choices each.
5. Mark the correct answers, set the status to **Open**, and publish.

### 1:45–2:50 — Student journey

1. Sign out, select **Student demo**, and sign in.
2. Open the newly published exam.
3. Show the timer, question map, progress indicator, and answer navigation.
4. Submit after confirming the attempt.
5. Point out the score, pass/fail outcome, and answer review.

### 2:50–3:35 — Results and persistence

1. Return to the student workspace and show the new history entry.
2. Sign in again as the teacher.
3. Open the demo exam's results and show the new submission metrics.
4. Refresh the page to demonstrate persistence.

### 3:35–4:00 — Engineering evidence

1. Open the API documentation at `http://localhost:4000/api/docs`.
2. Briefly show the architecture diagrams and automated verification result.
3. Close with the GitHub Actions, deployment, and Docker evidence links from
   `SUBMISSION.md`.

## Troubleshooting

- If login fails in API mode, verify the server health endpoint and rerun the
  database seed after a full volume reset.
- If the client reports a network error during host development, confirm that
  `VITE_API_URL` points to `http://localhost:4000/api`.
- If a newly published exam is not visible, confirm its status is **Open** and
  refresh the student dashboard.
- If mock data becomes unsuitable for another demonstration, clear browser site
  storage and sign in again.

For installation and operations, see [DEPLOYMENT.md](DEPLOYMENT.md). For manual
acceptance journeys and automated checks, see [TESTING.md](TESTING.md).
