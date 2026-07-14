import pg from 'pg';

const { Pool } = pg;

const userColumns = `
  id,
  full_name AS "fullName",
  email,
  password_hash AS "passwordHash",
  role,
  is_active AS "isActive",
  created_at AS "createdAt"
`;

const examColumns = `
  id,
  title,
  course,
  description,
  duration_minutes AS "durationMinutes",
  passing_score AS "passingScore",
  status,
  questions,
  created_by AS "createdBy",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const submissionColumns = `
  s.id,
  s.exam_id AS "examId",
  s.student_id AS "studentId",
  s.answers,
  s.score,
  s.correct_answers AS "correctAnswers",
  s.total_questions AS "totalQuestions",
  s.submitted_at AS "submittedAt",
  e.title AS "examTitle",
  u.full_name AS "studentName",
  e.passing_score AS "passingScore",
  (s.score >= e.passing_score) AS passed
`;

const sslForMode = (mode) => {
  if (mode === 'disable') {
    return undefined;
  }

  return { rejectUnauthorized: mode === 'verify-full' };
};

export class PostgresRepository {
  #pool;

  constructor({ connectionString, sslMode }) {
    this.#pool = new Pool({
      connectionString,
      ssl: sslForMode(sslMode),
      max: 15,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  }

  async health() {
    const result = await this.#pool.query(
      'SELECT current_database() AS database, CURRENT_TIMESTAMP AS "serverTime"',
    );
    return { provider: 'postgres', ready: true, ...result.rows[0] };
  }

  async findUserByEmail(email) {
    const result = await this.#pool.query(
      `SELECT ${userColumns} FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findUserById(id) {
    const result = await this.#pool.query(
      `SELECT ${userColumns} FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async createUser(input) {
    const result = await this.#pool.query(
      `
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ($1, LOWER($2), $3, $4)
        RETURNING ${userColumns}
      `,
      [input.fullName, input.email, input.passwordHash, input.role],
    );
    return result.rows[0];
  }

  async listExams({ status, createdBy } = {}) {
    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (createdBy) {
      values.push(createdBy);
      conditions.push(`created_by = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.#pool.query(
      `SELECT ${examColumns} FROM exams ${where} ORDER BY id`,
      values,
    );
    return result.rows;
  }

  async getExamById(id) {
    const result = await this.#pool.query(
      `SELECT ${examColumns} FROM exams WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async createExam(input) {
    const result = await this.#pool.query(
      `
        INSERT INTO exams (
          title, course, description, duration_minutes, passing_score,
          status, questions, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::JSONB, $8)
        RETURNING ${examColumns}
      `,
      [
        input.title,
        input.course,
        input.description,
        input.durationMinutes,
        input.passingScore,
        input.status,
        JSON.stringify(input.questions),
        input.createdBy,
      ],
    );
    return result.rows[0];
  }

  async updateExam(id, input) {
    const columnMap = {
      title: 'title',
      course: 'course',
      description: 'description',
      durationMinutes: 'duration_minutes',
      passingScore: 'passing_score',
      status: 'status',
      questions: 'questions',
    };
    const assignments = [];
    const values = [];

    for (const [property, column] of Object.entries(columnMap)) {
      if (Object.hasOwn(input, property)) {
        values.push(
          property === 'questions' ? JSON.stringify(input[property]) : input[property],
        );
        assignments.push(
          `${column} = $${values.length}${property === 'questions' ? '::JSONB' : ''}`,
        );
      }
    }

    if (assignments.length === 0) {
      return this.getExamById(id);
    }

    values.push(id);
    const result = await this.#pool.query(
      `
        UPDATE exams
        SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING ${examColumns}
      `,
      values,
    );
    return result.rows[0] ?? null;
  }

  async deleteExam(id) {
    const result = await this.#pool.query(
      `DELETE FROM exams WHERE id = $1 RETURNING ${examColumns}`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async createSubmission(input) {
    const inserted = await this.#pool.query(
      `
        INSERT INTO submissions (
          exam_id, student_id, answers, score, correct_answers, total_questions
        )
        VALUES ($1, $2, $3::JSONB, $4, $5, $6)
        RETURNING id
      `,
      [
        input.examId,
        input.studentId,
        JSON.stringify(input.answers),
        input.score,
        input.correctAnswers,
        input.totalQuestions,
      ],
    );
    const result = await this.#pool.query(
      `
        SELECT ${submissionColumns}
        FROM submissions s
        JOIN exams e ON e.id = s.exam_id
        JOIN users u ON u.id = s.student_id
        WHERE s.id = $1
      `,
      [inserted.rows[0].id],
    );
    return result.rows[0];
  }

  async listSubmissionsByStudent(studentId) {
    const result = await this.#pool.query(
      `
        SELECT ${submissionColumns}
        FROM submissions s
        JOIN exams e ON e.id = s.exam_id
        JOIN users u ON u.id = s.student_id
        WHERE s.student_id = $1
        ORDER BY s.submitted_at DESC
      `,
      [studentId],
    );
    return result.rows;
  }

  async listSubmissionsForTeacher(teacherId) {
    const result = await this.#pool.query(
      `
        SELECT ${submissionColumns}
        FROM submissions s
        JOIN exams e ON e.id = s.exam_id
        JOIN users u ON u.id = s.student_id
        WHERE e.created_by = $1
        ORDER BY s.submitted_at DESC
      `,
      [teacherId],
    );
    return result.rows;
  }

  async listSubmissionsByExam(examId) {
    const result = await this.#pool.query(
      `
        SELECT ${submissionColumns}
        FROM submissions s
        JOIN exams e ON e.id = s.exam_id
        JOIN users u ON u.id = s.student_id
        WHERE s.exam_id = $1
        ORDER BY s.submitted_at DESC
      `,
      [examId],
    );
    return result.rows;
  }

  async createAuditLog(input) {
    const result = await this.#pool.query(
      `
        INSERT INTO audit_logs (
          actor_id, action, entity_type, entity_id, request_id, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6::JSONB)
        RETURNING id
      `,
      [
        input.actorId ?? null,
        input.action,
        input.entityType,
        input.entityId ?? null,
        input.requestId ?? null,
        JSON.stringify(input.metadata ?? {}),
      ],
    );
    return result.rows[0];
  }

  async close() {
    await this.#pool.end();
  }
}
