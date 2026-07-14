"""Focused Flask microservice for ExamApp score calculation."""

from __future__ import annotations

import math
import os
from typing import Any

from flask import Flask, jsonify, request

SERVICE_NAME = "examapp-scoring"
SERVICE_VERSION = "1.1.0"
DEFAULT_PASSING_SCORE = 60


class ScoreValidationError(ValueError):
    """Raised when an exam scoring request is invalid."""


def _whole_number(value: Any, field_name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ScoreValidationError(f'"{field_name}" must be a whole number.')
    if not math.isfinite(float(value)) or not float(value).is_integer():
        raise ScoreValidationError(f'"{field_name}" must be a whole number.')
    return int(value)


def calculate_score(payload: dict[str, Any]) -> dict[str, Any]:
    correct_answers = _whole_number(payload.get("correctAnswers"), "correctAnswers")
    total_questions = _whole_number(payload.get("totalQuestions"), "totalQuestions")
    passing_score = _whole_number(payload.get("passingScore", DEFAULT_PASSING_SCORE), "passingScore")

    if total_questions <= 0:
        raise ScoreValidationError('"totalQuestions" must be greater than zero.')
    if correct_answers < 0 or correct_answers > total_questions:
        raise ScoreValidationError('"correctAnswers" must be between zero and "totalQuestions".')
    if passing_score < 0 or passing_score > 100:
        raise ScoreValidationError('"passingScore" must be between 0 and 100.')

    score = round((correct_answers / total_questions) * 100, 2)
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    passed = score >= passing_score
    return {
        "service": SERVICE_NAME,
        "correctAnswers": correct_answers,
        "totalQuestions": total_questions,
        "passingScore": passing_score,
        "score": score,
        "grade": grade,
        "passed": passed,
        "message": "Exam passed." if passed else "Exam not passed.",
    }


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    @app.after_request
    def apply_headers(response):
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.get("/health")
    def health():
        return jsonify({"service": SERVICE_NAME, "status": "ok", "version": SERVICE_VERSION, "port": int(os.getenv("PORT", "5002"))})

    @app.post("/api/score")
    def score_exam():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": {"code": "INVALID_SCORE_INPUT", "message": "Request body must be a JSON object."}}), 400
        try:
            return jsonify(calculate_score(payload))
        except ScoreValidationError as error:
            return jsonify({"error": {"code": "INVALID_SCORE_INPUT", "message": str(error)}}), 400

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "The requested scoring route does not exist."}}), 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return jsonify({"error": {"code": "METHOD_NOT_ALLOWED", "message": "This scoring route does not accept that HTTP method."}}), 405

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5002")), debug=False)
