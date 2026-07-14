[CmdletBinding()]
param(
    [string]$GatewayUrl = 'http://localhost:3000',
    [string]$ScoringUrl = 'http://localhost:5002',
    [string]$AnalyticsUrl = 'http://localhost:5001',
    [int]$Retries = 12,
    [int]$RetryDelaySeconds = 2
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-JsonWithRetry {
    param([Parameter(Mandatory = $true)][string]$Uri, [int]$Attempts = $Retries)
    $lastError = $null
    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try { return Invoke-RestMethod -Uri $Uri -Method Get -TimeoutSec 10 }
        catch { $lastError = $_; if ($attempt -lt $Attempts) { Start-Sleep -Seconds $RetryDelaySeconds } }
    }
    throw "Request failed after $Attempts attempts: $Uri`n$lastError"
}

function Assert-Equal {
    param([Parameter(Mandatory = $true)]$Actual, [Parameter(Mandatory = $true)]$Expected, [Parameter(Mandatory = $true)][string]$Label)
    if ($Actual -ne $Expected) { throw "$Label failed. Expected '$Expected', received '$Actual'." }
    Write-Host "[PASS] $Label" -ForegroundColor Green
}

Write-Host 'ExamApp microservices smoke test' -ForegroundColor Cyan
$gatewayHealth = Invoke-JsonWithRetry "$GatewayUrl/health"
Assert-Equal $gatewayHealth.service 'examapp-gateway' 'Gateway health'
$scoringHealth = Invoke-JsonWithRetry "$ScoringUrl/health"
Assert-Equal $scoringHealth.service 'examapp-scoring' 'Scoring health'
$analyticsHealth = Invoke-JsonWithRetry "$AnalyticsUrl/health"
Assert-Equal $analyticsHealth.service 'examapp-analytics' 'Analytics health'
$services = Invoke-JsonWithRetry "$GatewayUrl/api/services"
Assert-Equal $services.status 'ok' 'Gateway service aggregation'
Assert-Equal $services.services.scoring.status 'ok' 'Gateway to scoring network call'
Assert-Equal $services.services.analytics.status 'ok' 'Gateway to analytics network call'
$score = Invoke-JsonWithRetry "$GatewayUrl/api/score?correct=4&total=5&passingScore=60"
Assert-Equal ([double]$score.data.score) 80 'Scoring calculation (4/5 = 80)'
Assert-Equal ([bool]$score.data.passed) $true 'Scoring pass result'
$analytics = Invoke-JsonWithRetry "$GatewayUrl/api/analytics"
Assert-Equal ([int]$analytics.data.summary.totalAttempts) 5 'Analytics attempt count'
Assert-Equal ([double]$analytics.data.summary.averageScore) 74.8 'Analytics average score'
$demo = Invoke-JsonWithRetry "$GatewayUrl/api/demo"
Assert-Equal $demo.status 'ok' 'End-to-end aggregate demo'
Write-Host 'All microservices checks passed.' -ForegroundColor Green
