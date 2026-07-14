BEGIN;

INSERT INTO users (id, full_name, email, password_hash, role, is_active)
VALUES
  (1, 'Teacher Demo', 'teacher@examapp.local', '$2b$10$MM2lQDrUKWnBlbUr6c6hp.tCicgFXscmRo9zjPaSptvjag8f0a8jG', 'teacher', TRUE),
  (2, 'Student Demo', 'student@examapp.local', '$2b$10$MM2lQDrUKWnBlbUr6c6hp.tCicgFXscmRo9zjPaSptvjag8f0a8jG', 'student', TRUE)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO exams (
  id, title, course, description, duration_minutes, passing_score,
  status, questions, created_by
)
VALUES
  (
    101,
    'React Basics Exam',
    'Frontend Development',
    'Components, props, state, and hooks.',
    45,
    60,
    'open',
    '[
      {"id":1,"text":"What is a React component?","answers":["A reusable UI building block","A database table","A CSS file","A server-only function"],"correctAnswerIndex":0},
      {"id":2,"text":"Which hook manages component state?","answers":["useRoute","useState","useServer","useHTML"],"correctAnswerIndex":1},
      {"id":3,"text":"What are props used for?","answers":["Passing data to components","Deleting files","Changing the browser","Creating a database"],"correctAnswerIndex":0}
    ]'::JSONB,
    1
  ),
  (
    102,
    'JavaScript Fundamentals',
    'Web Programming',
    'Variables, arrays, functions, and objects.',
    60,
    70,
    'open',
    '[
      {"id":1,"text":"Which keyword declares a block-scoped variable?","answers":["table","let","style","page"],"correctAnswerIndex":1},
      {"id":2,"text":"What type does Array.isArray([]) detect?","answers":["Array","Number","Boolean","CSS"],"correctAnswerIndex":0}
    ]'::JSONB,
    1
  ),
  (
    103,
    'HTML and CSS Review',
    'Web Basics',
    'A closed sample exam for teacher management.',
    30,
    60,
    'closed',
    '[
      {"id":1,"text":"What does HTML stand for?","answers":["HyperText Markup Language","HighText Machine Language","Home Tool Markup Language"],"correctAnswerIndex":0}
    ]'::JSONB,
    1
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  course = EXCLUDED.course,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  passing_score = EXCLUDED.passing_score,
  status = EXCLUDED.status,
  questions = EXCLUDED.questions,
  created_by = EXCLUDED.created_by;

INSERT INTO submissions (
  id, exam_id, student_id, answers, score, correct_answers,
  total_questions, submitted_at
)
VALUES
  (1, 101, 2, '{"1":0,"2":1,"3":0}'::JSONB, 100, 3, 3, '2026-06-01T10:00:00Z'),
  (2, 102, 2, '{"1":1,"2":0}'::JSONB, 100, 2, 2, '2026-06-02T10:00:00Z'),
  (3, 101, 2, '{"1":0,"2":0,"3":0}'::JSONB, 67, 2, 3, '2026-06-03T10:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  exam_id = EXCLUDED.exam_id,
  student_id = EXCLUDED.student_id,
  answers = EXCLUDED.answers,
  score = EXCLUDED.score,
  correct_answers = EXCLUDED.correct_answers,
  total_questions = EXCLUDED.total_questions,
  submitted_at = EXCLUDED.submitted_at;

INSERT INTO audit_logs (
  id, actor_id, action, entity_type, entity_id, request_id, metadata, created_at
)
VALUES
  (1, 1, 'seed.create', 'exam', 101, 'seed', '{"source":"002_seed.sql"}'::JSONB, '2026-06-01T08:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  actor_id = EXCLUDED.actor_id,
  action = EXCLUDED.action,
  entity_type = EXCLUDED.entity_type,
  entity_id = EXCLUDED.entity_id,
  request_id = EXCLUDED.request_id,
  metadata = EXCLUDED.metadata,
  created_at = EXCLUDED.created_at;

SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1), TRUE);
SELECT setval(pg_get_serial_sequence('exams', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM exams), 1), TRUE);
SELECT setval(pg_get_serial_sequence('submissions', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM submissions), 1), TRUE);
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM audit_logs), 1), TRUE);

COMMIT;
