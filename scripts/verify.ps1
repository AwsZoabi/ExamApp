[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$SkipMicroservices
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    Write-Host "`n==> $Name" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }
    Write-Host "[PASS] $Name" -ForegroundColor Green
}

Push-Location $root
try {
    if (-not $SkipInstall) {
        Invoke-Step 'Install client dependencies' { npm.cmd --prefix client ci }
        Invoke-Step 'Install server dependencies' { npm.cmd --prefix server ci }
    }

    Invoke-Step 'Client lint' { npm.cmd --prefix client run lint }
    Invoke-Step 'Client tests' { npm.cmd --prefix client run test -- --run }
    Invoke-Step 'Client production build' { npm.cmd --prefix client run build }
    Invoke-Step 'Server lint' { npm.cmd --prefix server run lint }
    Invoke-Step 'Server tests' { npm.cmd --prefix server run test -- --run }
    Invoke-Step 'Server syntax check' { npm.cmd --prefix server run check }
    Invoke-Step 'Main Docker Compose validation' { docker compose --env-file .env.example config --quiet }

    $previousDockerUsername = $env:DOCKERHUB_USERNAME
    $previousImageTag = $env:IMAGE_TAG
    $previousDatabaseName = $env:POSTGRES_DB
    $previousDatabaseUser = $env:POSTGRES_USER
    $previousDatabasePassword = $env:POSTGRES_PASSWORD
    $previousJwtSecret = $env:JWT_SECRET
    $previousPublicOrigin = $env:PUBLIC_CLIENT_ORIGIN
    try {
        $env:DOCKERHUB_USERNAME = 'verification-user'
        $env:IMAGE_TAG = 'verification'
        $env:POSTGRES_DB = 'examapp'
        $env:POSTGRES_USER = 'examapp'
        $env:POSTGRES_PASSWORD = 'verification-only-password'
        $env:JWT_SECRET = 'verification-only-secret-with-32-characters'
        $env:PUBLIC_CLIENT_ORIGIN = 'https://examapp.example.test'
        Invoke-Step 'Production Docker Compose validation' { docker compose -f docker-compose.prod.yml config --quiet }
    }
    finally {
        $env:DOCKERHUB_USERNAME = $previousDockerUsername
        $env:IMAGE_TAG = $previousImageTag
        $env:POSTGRES_DB = $previousDatabaseName
        $env:POSTGRES_USER = $previousDatabaseUser
        $env:POSTGRES_PASSWORD = $previousDatabasePassword
        $env:JWT_SECRET = $previousJwtSecret
        $env:PUBLIC_CLIENT_ORIGIN = $previousPublicOrigin
    }

    if (-not $SkipMicroservices) {
        Invoke-Step 'Microservices gateway syntax check' { npm.cmd --prefix microservices/gateway run check }
        Invoke-Step 'Microservices gateway tests' { npm.cmd --prefix microservices/gateway test }

        $verifyRoot = Join-Path $root '.verify'
        $pythonEnvironment = Join-Path $verifyRoot 'python'
        $pythonExecutable = Join-Path $pythonEnvironment 'Scripts\python.exe'
        if (-not (Test-Path $pythonExecutable)) {
            Invoke-Step 'Create isolated Python environment' { python -m venv $pythonEnvironment }
        }
        Invoke-Step 'Install scoring-service dependencies' {
            & $pythonExecutable -m pip install --disable-pip-version-check --quiet -r microservices/scoring-service/requirements.txt
        }
        Invoke-Step 'Python scoring tests' {
            & $pythonExecutable -m unittest discover -s microservices/scoring-service -p 'test_*.py' -v
        }

        $previousAppData = $env:APPDATA
        $previousDotnetHome = $env:DOTNET_CLI_HOME
        $previousNugetPackages = $env:NUGET_PACKAGES
        $previousNugetScratch = $env:NUGET_SCRATCH
        try {
            $env:APPDATA = Join-Path $verifyRoot 'appdata'
            $env:DOTNET_CLI_HOME = Join-Path $verifyRoot 'dotnet-home'
            $env:NUGET_PACKAGES = Join-Path $verifyRoot 'nuget-packages'
            $env:NUGET_SCRATCH = Join-Path $verifyRoot 'nuget-scratch'
            New-Item -ItemType Directory -Force -Path $env:APPDATA, $env:DOTNET_CLI_HOME, $env:NUGET_PACKAGES, $env:NUGET_SCRATCH | Out-Null
            Invoke-Step '.NET analytics restore' {
                dotnet restore microservices/analytics-service/AnalyticsService.csproj --configfile microservices/analytics-service/NuGet.Config --nologo
            }
            Invoke-Step '.NET analytics build' {
                dotnet build microservices/analytics-service/AnalyticsService.csproj --configuration Release --no-restore --nologo
            }
        }
        finally {
            $env:APPDATA = $previousAppData
            $env:DOTNET_CLI_HOME = $previousDotnetHome
            $env:NUGET_PACKAGES = $previousNugetPackages
            $env:NUGET_SCRATCH = $previousNugetScratch
        }

        Invoke-Step 'Microservices Compose validation' { docker compose -f microservices/docker-compose.yml config --quiet }

        $previousUsername = $env:DOCKERHUB_USERNAME
        $previousTag = $env:IMAGE_TAG
        try {
            $env:DOCKERHUB_USERNAME = 'verification-user'
            $env:IMAGE_TAG = 'verification'
            Invoke-Step 'Production microservices Compose validation' { docker compose -f microservices/docker-compose.prod.yml config --quiet }
        }
        finally {
            $env:DOCKERHUB_USERNAME = $previousUsername
            $env:IMAGE_TAG = $previousTag
        }
    }

    Write-Host "`nAll requested verification steps passed." -ForegroundColor Green
}
finally {
    Pop-Location
}
