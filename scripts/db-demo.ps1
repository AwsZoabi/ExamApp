[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    Write-Host 'PostgreSQL connectivity' -ForegroundColor Cyan
    docker compose exec postgres pg_isready -U examapp -d examapp

    Write-Host "`nTables" -ForegroundColor Cyan
    docker compose exec postgres psql -U examapp -d examapp -c '\dt'

    Write-Host "`nHybrid exam rows and JSONB question counts" -ForegroundColor Cyan
    docker compose exec postgres psql -U examapp -d examapp -c 'SELECT id, title, status, jsonb_array_length(questions) AS question_count FROM exams ORDER BY id;'

    Write-Host "`nQuestions extracted from one JSONB exam" -ForegroundColor Cyan
    docker compose exec postgres psql -U examapp -d examapp -c "SELECT question->>'id' AS question_id, question->>'text' AS question FROM exams CROSS JOIN LATERAL jsonb_array_elements(questions) AS question WHERE exams.id = 101;"

    Write-Host "`nSubmissions with JSONB answers" -ForegroundColor Cyan
    docker compose exec postgres psql -U examapp -d examapp -c 'SELECT id, exam_id, student_id, answers, score, submitted_at FROM submissions ORDER BY id;'
}
finally {
    Pop-Location
}
