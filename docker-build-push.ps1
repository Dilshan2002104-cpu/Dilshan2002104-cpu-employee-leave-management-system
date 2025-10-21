# Docker Build and Push Script for ELMS
# Make sure to update DOCKERHUB_USERNAME with your actual DockerHub username

param(
    [string]$DockerHubUsername = "dilshan2002104",  # Updated with your GitHub username
    [string]$ImageTag = "latest"
)

Write-Host "🐳 ELMS Docker Build and Push Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

if ($DockerHubUsername -eq "your-dockerhub-username") {
    Write-Host "❌ Please update DockerHubUsername in the script!" -ForegroundColor Red
    $DockerHubUsername = Read-Host "Enter your DockerHub username"
}

$BackendImage = "$DockerHubUsername/elms-backend:$ImageTag"
$FrontendImage = "$DockerHubUsername/elms-frontend:$ImageTag"

function Test-Docker {
    Write-Host "🔍 Checking Docker installation..." -ForegroundColor Blue
    try {
        docker --version | Out-Null
        Write-Host "✅ Docker is installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
        Write-Host "Please install Docker Desktop and make sure it's running." -ForegroundColor Yellow
        exit 1
    }
}

function Build-Backend {
    Write-Host "🔨 Building backend..." -ForegroundColor Blue
    
    # Build the Spring Boot JAR first
    Set-Location ELMS
    Write-Host "📦 Building Spring Boot JAR..." -ForegroundColor Yellow
    if (Test-Path "mvnw.cmd") {
        & .\mvnw.cmd clean package -DskipTests
    } else {
        mvn clean package -DskipTests
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build Spring Boot JAR!" -ForegroundColor Red
        exit 1
    }
    
    # Build Docker image
    Write-Host "🐳 Building Docker image: $BackendImage" -ForegroundColor Yellow
    docker build -t $BackendImage .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend Docker image built successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to build backend Docker image!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
}

function Build-Frontend {
    Write-Host "🔨 Building frontend..." -ForegroundColor Blue
    
    Set-Location frontend
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build Docker image
    Write-Host "🐳 Building Docker image: $FrontendImage" -ForegroundColor Yellow
    docker build -t $FrontendImage .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend Docker image built successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to build frontend Docker image!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
}

function Push-Images {
    Write-Host "📤 Pushing images to DockerHub..." -ForegroundColor Blue
    
    # Login to DockerHub
    Write-Host "🔐 Please login to DockerHub:" -ForegroundColor Yellow
    docker login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login to DockerHub!" -ForegroundColor Red
        exit 1
    }
    
    # Push backend image
    Write-Host "📤 Pushing backend image..." -ForegroundColor Yellow
    docker push $BackendImage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend image pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push backend image!" -ForegroundColor Red
        exit 1
    }
    
    # Push frontend image
    Write-Host "📤 Pushing frontend image..." -ForegroundColor Yellow
    docker push $FrontendImage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend image pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push frontend image!" -ForegroundColor Red
        exit 1
    }
}

function Show-Images {
    Write-Host "📋 Built Docker images:" -ForegroundColor Cyan
    docker images | Where-Object { $_ -match $DockerHubUsername }
}

function Test-Images {
    Write-Host "🧪 Testing Docker images locally..." -ForegroundColor Blue
    
    Write-Host "🐳 Starting containers with docker-compose..." -ForegroundColor Yellow
    
    # Create temporary docker-compose file with your images
    $dockerComposeContent = @"
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: elms-mysql-test
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: empdb
      MYSQL_USER: elms_user
      MYSQL_PASSWORD: elms_password
    ports:
      - "3307:3306"
    networks:
      - elms-test-network

  backend:
    image: $BackendImage
    container_name: elms-backend-test
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: empdb
      DB_USERNAME: elms_user
      DB_PASSWORD: elms_password
      SPRING_PROFILES_ACTIVE: aws
    ports:
      - "8081:8080"
    depends_on:
      - mysql
    networks:
      - elms-test-network

  frontend:
    image: $FrontendImage
    container_name: elms-frontend-test
    ports:
      - "8082:80"
    depends_on:
      - backend
    networks:
      - elms-test-network

networks:
  elms-test-network:
    driver: bridge
"@
    
    $dockerComposeContent | Out-File -FilePath "docker-compose.test.yml" -Encoding UTF8
    
    docker-compose -f docker-compose.test.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test containers started successfully!" -ForegroundColor Green
        Write-Host "🌐 Test URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:8082" -ForegroundColor White
        Write-Host "   Backend: http://localhost:8081" -ForegroundColor White
        Write-Host ""
        Write-Host "To stop test containers, run: docker-compose -f docker-compose.test.yml down" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to start test containers!" -ForegroundColor Red
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "Select an option:" -ForegroundColor Cyan
    Write-Host "1) Build backend image only" -ForegroundColor White
    Write-Host "2) Build frontend image only" -ForegroundColor White
    Write-Host "3) Build both images" -ForegroundColor White
    Write-Host "4) Push images to DockerHub" -ForegroundColor White
    Write-Host "5) Build and push (complete process)" -ForegroundColor White
    Write-Host "6) Test images locally" -ForegroundColor White
    Write-Host "7) Show built images" -ForegroundColor White
    Write-Host "8) Generate AWS deployment commands" -ForegroundColor White
    Write-Host "9) Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice [1-9]"
    
    switch ($choice) {
        "1" {
            Test-Docker
            Build-Backend
            Show-Menu
        }
        "2" {
            Test-Docker
            Build-Frontend
            Show-Menu
        }
        "3" {
            Test-Docker
            Build-Backend
            Build-Frontend
            Show-Menu
        }
        "4" {
            Test-Docker
            Push-Images
            Show-Menu
        }
        "5" {
            Test-Docker
            Build-Backend
            Build-Frontend
            Push-Images
            Write-Host ""
            Write-Host "🎉 Complete! Your images are now available on DockerHub:" -ForegroundColor Green
            Write-Host "   Backend: $BackendImage" -ForegroundColor White
            Write-Host "   Frontend: $FrontendImage" -ForegroundColor White
            Show-Menu
        }
        "6" {
            Test-Docker
            Test-Images
            Show-Menu
        }
        "7" {
            Test-Docker
            Show-Images
            Show-Menu
        }
        "8" {
            Write-Host ""
            Write-Host "🚀 AWS Deployment Commands:" -ForegroundColor Green
            Write-Host "============================" -ForegroundColor Green
            Write-Host ""
            Write-Host "1. SSH to your AWS server:" -ForegroundColor Yellow
            Write-Host "   ssh -i `"C:\Users\User\Downloads\Praveen.pem`" ubuntu@16.170.210.109" -ForegroundColor White
            Write-Host ""
            Write-Host "2. Install Docker (if not installed):" -ForegroundColor Yellow
            Write-Host "   sudo apt update" -ForegroundColor White
            Write-Host "   sudo apt install docker.io docker-compose -y" -ForegroundColor White
            Write-Host "   sudo systemctl start docker" -ForegroundColor White
            Write-Host "   sudo systemctl enable docker" -ForegroundColor White
            Write-Host "   sudo usermod -aG docker ubuntu" -ForegroundColor White
            Write-Host ""
            Write-Host "3. Pull and run your images:" -ForegroundColor Yellow
            Write-Host "   docker pull $BackendImage" -ForegroundColor White
            Write-Host "   docker pull $FrontendImage" -ForegroundColor White
            Write-Host ""
            Write-Host "4. Run with docker-compose (recommended):" -ForegroundColor Yellow
            Write-Host "   Create docker-compose.yml with your images and run:" -ForegroundColor White
            Write-Host "   docker-compose up -d" -ForegroundColor White
            Write-Host ""
            Show-Menu
        }
        "9" {
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "❌ Invalid option. Please try again." -ForegroundColor Red
            Show-Menu
        }
    }
}

# Start the script
Write-Host "📋 Current Configuration:" -ForegroundColor Yellow
Write-Host "   DockerHub Username: $DockerHubUsername" -ForegroundColor White
Write-Host "   Backend Image: $BackendImage" -ForegroundColor White
Write-Host "   Frontend Image: $FrontendImage" -ForegroundColor White

Show-Menu