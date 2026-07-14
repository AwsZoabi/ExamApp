import unittest

from app import calculate_score, create_app


class ScoreCalculationTests(unittest.TestCase):
    def test_calculates_passing_score_and_grade(self):
        result = calculate_score({"correctAnswers": 4, "totalQuestions": 5, "passingScore": 60})
        self.assertEqual(result["score"], 80)
        self.assertEqual(result["grade"], "B")
        self.assertTrue(result["passed"])

    def test_calculates_failed_exam(self):
        result = calculate_score({"correctAnswers": 2, "totalQuestions": 5})
        self.assertEqual(result["score"], 40)
        self.assertEqual(result["grade"], "F")
        self.assertFalse(result["passed"])

    def test_rejects_more_correct_answers_than_questions(self):
        with self.assertRaisesRegex(ValueError, "between zero"):
            calculate_score({"correctAnswers": 6, "totalQuestions": 5})


class ScoringApiTests(unittest.TestCase):
    def setUp(self):
        app = create_app()
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["service"], "examapp-scoring")
        self.assertEqual(response.get_json()["status"], "ok")

    def test_score_endpoint(self):
        response = self.client.post("/api/score", json={"correctAnswers": 9, "totalQuestions": 10, "passingScore": 70})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["score"], 90)
        self.assertEqual(response.get_json()["grade"], "A")

    def test_rejects_zero_questions(self):
        response = self.client.post("/api/score", json={"correctAnswers": 0, "totalQuestions": 0})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "INVALID_SCORE_INPUT")

    def test_rejects_non_json_body(self):
        response = self.client.post("/api/score", data="not-json", content_type="text/plain")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "INVALID_SCORE_INPUT")


if __name__ == "__main__":
    unittest.main()
