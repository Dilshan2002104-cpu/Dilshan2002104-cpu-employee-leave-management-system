# ELMS CI/CD Setup Validation Script (PowerShell)
# This script helps validate your CI/CD setup before pushing to GitHub

param(
    [switch]$Detailed
)

Write-Host "🔍 ELMS CI/CD Setup Validation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Function to print status
function Write-Status {
    param($Success, $Message)
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if we're in the right directory
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Checking project structure..." -ForegroundColor Yellow

# Check for required files
$RequiredFiles = @(
    ".github/workflows/ci-cd.yml",
    ".github/workflows/pr-validation.yml",
    ".github/workflows/dependency-updates.yml",
    ".github/workflows/release.yml",
    "ELMS/Dockerfile",
    "frontend/Dockerfile",
    "docker-compose.yml",
    ".env.example"
)

foreach ($file in $RequiredFiles) {
    $exists = Test-Path $file
    Write-Status $exists "Found $file"
}

Write-Host ""
Write-Host "🔧 Checking development tools..." -ForegroundColor Yellow

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Status $true "Java found ($($javaVersion.Line))"
} catch {
    Write-Status $false "Java not found"
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Status $true "Node.js found (version: $nodeVersion)"
} catch {
    Write-Status $false "Node.js not found"
}

# Check Maven
try {
    $mvnVersion = mvn --version 2>$null | Select-Object -First 1
    Write-Status $true "Maven found"
} catch {
    Write-Status $false "Maven not found"
}

# Check Docker
try {
    $dockerVersion = docker --version 2>$null
    Write-Status $true "Docker found"
} catch {
    Write-Status $false "Docker not found"
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version 2>$null
    Write-Status $true "Docker Compose found"
} catch {
    Write-Status $false "Docker Compose not found"
}

Write-Host ""
Write-Host "📋 Validating configuration files..." -ForegroundColor Yellow

# Check pom.xml
if (Test-Path "ELMS/pom.xml") {
    $pomContent = Get-Content "ELMS/pom.xml" -Raw
    if ($pomContent -match "spring-boot-starter-parent") {
        Write-Status $true "Spring Boot configuration valid"
    } else {
        Write-Status $false "Spring Boot configuration issues in pom.xml"
    }
} else {
    Write-Status $false "ELMS/pom.xml not found"
}

# Check package.json
if (Test-Path "frontend/package.json") {
    $packageContent = Get-Content "frontend/package.json" -Raw
    if ($packageContent -match "react") {
        Write-Status $true "React configuration valid"
    } else {
        Write-Status $false "React configuration issues in package.json"
    }
} else {
    Write-Status $false "frontend/package.json not found"
}

# Check Dockerfiles
Write-Host ""
Write-Host "🐳 Validating Dockerfiles..." -ForegroundColor Yellow

if (Test-Path "ELMS/Dockerfile") {
    $backendDockerfile = Get-Content "ELMS/Dockerfile" -Raw
    
    if ($backendDockerfile -match "openjdk:17") {
        Write-Status $true "Backend Dockerfile using Java 17"
    } else {
        Write-Warning "Backend Dockerfile not using Java 17"
    }
    
    if ($backendDockerfile -match "EXPOSE 8080") {
        Write-Status $true "Backend Dockerfile exposes port 8080"
    } else {
        Write-Status $false "Backend Dockerfile doesn't expose port 8080"
    }
}

if (Test-Path "frontend/Dockerfile") {
    $frontendDockerfile = Get-Content "frontend/Dockerfile" -Raw
    
    if ($frontendDockerfile -match "nginx") {
        Write-Status $true "Frontend Dockerfile uses Nginx"
    } else {
        Write-Warning "Frontend Dockerfile doesn't use Nginx"
    }
    
    if ($frontendDockerfile -match "EXPOSE 80") {
        Write-Status $true "Frontend Dockerfile exposes port 80"
    } else {
        Write-Status $false "Frontend Dockerfile doesn't expose port 80"
    }
}

Write-Host ""
Write-Host "🧪 Running basic build tests..." -ForegroundColor Yellow

# Test backend build
if ((Test-Path "ELMS") -and (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Info "Testing Maven build..."
    Push-Location "ELMS"
    try {
        $null = mvn clean compile -q 2>$null
        Write-Status $true "Backend compiles successfully"
    } catch {
        Write-Status $false "Backend compilation failed"
    }
    Pop-Location
}

# Test frontend build
if ((Test-Path "frontend") -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Info "Testing NPM build..."
    Push-Location "frontend"
    try {
        npm install --silent 2>$null
        npm run build 2>$null
        Write-Status $true "Frontend builds successfully"
    } catch {
        Write-Status $false "Frontend build failed"
    }
    Pop-Location
}

Write-Host ""
Write-Host "🔍 Checking GitHub Actions workflows..." -ForegroundColor Yellow

# Check workflow syntax (basic check)
$workflows = Get-ChildItem ".github/workflows/*.yml" -ErrorAction SilentlyContinue
foreach ($workflow in $workflows) {
    $content = Get-Content $workflow.FullName -Raw
    if (($content -match "name:") -and ($content -match "on:") -and ($content -match "jobs:")) {
        Write-Status $true "$($workflow.Name) has valid structure"
    } else {
        Write-Status $false "$($workflow.Name) has invalid structure"
    }
}

Write-Host ""
Write-Host "📝 Checking documentation..." -ForegroundColor Yellow

# Check if README exists and has basic content
if (Test-Path "README.md") {
    $readmeContent = Get-Content "README.md" -Raw
    
    if ($readmeContent -match "Employee Leave Management System") {
        Write-Status $true "README.md has project description"
    } else {
        Write-Status $false "README.md missing project description"
    }
    
    if ($readmeContent -match "CI/CD") {
        Write-Status $true "README.md mentions CI/CD"
    } else {
        Write-Warning "README.md should mention CI/CD setup"
    }
}

if (Test-Path "CI-CD-SETUP.md") {
    Write-Status $true "CI/CD documentation found"
} else {
    Write-Status $false "CI/CD documentation missing"
}

Write-Host ""
Write-Host "🔑 GitHub Secrets Checklist" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Info "Make sure you have configured these secrets in GitHub:"
Write-Host "   - DOCKER_PASSWORD (your DockerHub password)"
Write-Host "   - AWS_ACCESS_KEY_ID (for AWS deployment)"
Write-Host "   - AWS_SECRET_ACCESS_KEY (for AWS deployment)"
Write-Host "   - EC2_SSH_PRIVATE_KEY (your EC2 private key content)"
Write-Host "   - EC2_HOSTNAME (your EC2 instance IP)"

Write-Host ""
Write-Host "🚀 Next Steps" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Info "If all checks pass:"
Write-Host "   1. Commit and push your changes to GitHub"
Write-Host "   2. Create a Pull Request to test PR validation"
Write-Host "   3. Merge to main branch to trigger deployment"
Write-Host "   4. Create a release tag (e.g., v1.0.0) to test release workflow"

Write-Host ""
Write-Info "To create a release:"
Write-Host "   git tag v1.0.0"
Write-Host "   git push origin v1.0.0"

Write-Host ""
Write-Host "✅ Validation complete!" -ForegroundColor Green
Write-Host "Check any failed items above before proceeding with CI/CD setup." -ForegroundColor Yellow