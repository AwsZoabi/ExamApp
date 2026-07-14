[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://localhost:4000/api',
    [switch]$StartStack
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
try {
    if ($StartStack) {
        Write-Host 'Starting ExamApp containers...' -ForegroundColor Cyan
        docker compose up --build --detach --wait
        if ($LASTEXITCODE -ne 0) { throw 'Docker Compose startup failed.' }
    }

    Write-Host 'Checking API health...' -ForegroundColor Cyan
    $health = Invoke-RestMethod "$BaseUrl/health"
    $health | ConvertTo-Json -Depth 8

    Write-Host 'Logging in as the demo teacher...' -ForegroundColor Cyan
    $login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body (@{
        email = 'teacher@examapp.local'
        password = '123456'
    } | ConvertTo-Json)

    $token = if ($login.token) { $login.token } elseif ($login.data.token) { $login.data.token } else { throw 'Login response did not contain a token.' }
    $headers = @{ Authorization = "Bearer $token" }

    Write-Host 'Loading teacher dashboard and exams...' -ForegroundColor Cyan
    Invoke-RestMethod -Headers $headers "$BaseUrl/dashboard/teacher" | ConvertTo-Json -Depth 10
    Invoke-RestMethod -Headers $headers "$BaseUrl/exams" | ConvertTo-Json -Depth 10

    Write-Host "`nBrowser application: http://localhost:8080" -ForegroundColor Green
    Write-Host 'Demo accounts: teacher@examapp.local / 123456 and student@examapp.local / 123456' -ForegroundColor Green
}
finally {
    Pop-Location
}

