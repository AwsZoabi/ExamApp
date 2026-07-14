-- Show each question as a row while keeping the exam relational.
SELECT
  e.id AS exam_id,
  e.title,
  question.ordinality AS question_number,
  question.value ->> 'text' AS question_text,
  question.value -> 'answers' AS answer_options
FROM exams e
CROSS JOIN LATERAL jsonb_array_elements(e.questions)
  WITH ORDINALITY AS question(value, ordinality)
ORDER BY e.id, question.ordinality;

-- Find exams containing a question with a specific answer option.
SELECT DISTINCT e.id, e.title
FROM exams e
CROSS JOIN LATERAL jsonb_array_elements(e.questions) AS question
WHERE question -> 'answers' ? 'useState';

-- Expand a student's answer object into rows.
SELECT
  s.id AS submission_id,
  s.exam_id,
  answer.key AS question_id,
  answer.value AS selected_answer_index
FROM submissions s
CROSS JOIN LATERAL jsonb_each(s.answers) AS answer
ORDER BY s.id, answer.key::INTEGER;

-- Teacher reporting with relational joins and JSONB question counts.
SELECT
  e.id,
  e.title,
  jsonb_array_length(e.questions) AS question_count,
  COUNT(s.id) AS submission_count,
  COALESCE(ROUND(AVG(s.score), 2), 0) AS average_score
FROM exams e
LEFT JOIN submissions s ON s.exam_id = e.id
GROUP BY e.id, e.title, e.questions
ORDER BY e.id;

-- Locate audit events by JSONB metadata.
SELECT id, action, entity_type, entity_id, metadata, created_at
FROM audit_logs
WHERE metadata @> '{"source":"002_seed.sql"}'::JSONB;
