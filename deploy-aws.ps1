# ELMS AWS Deployment Script for Windows PowerShell
# Server: 16.170.210.109

Write-Host "🚀 ELMS AWS Deployment Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "Target Server: 16.170.210.109" -ForegroundColor Yellow
Write-Host ""

# Configuration variables - UPDATE THESE
$AWS_SERVER_IP = "16.170.210.109"
$KEY_FILE_PATH = "path\to\your\key.pem"  # Update this path
$SERVER_USER = "ec2-user"
$DB_PASSWORD = "your_secure_password"    # Update this password

function Test-KeyFile {
    if (-not (Test-Path $KEY_FILE_PATH)) {
        Write-Host "❌ SSH key file not found: $KEY_FILE_PATH" -ForegroundColor Red
        Write-Host "Please update the KEY_FILE_PATH variable in this script" -ForegroundColor Yellow
        $script:KEY_FILE_PATH = Read-Host "Enter path to your SSH key file"
        if (-not (Test-Path $KEY_FILE_PATH)) {
            Write-Host "❌ Key file still not found. Exiting." -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ SSH key file found: $KEY_FILE_PATH" -ForegroundColor Green
}

function Build-Backend {
    Write-Host "📦 Building Spring Boot application..." -ForegroundColor Blue
    Set-Location ELMS
    
    if (Test-Path "mvnw.cmd") {
        & .\mvnw.cmd clean package -DskipTests
    } else {
        mvn clean package -DskipTests
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed!" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

function Build-Frontend {
    Write-Host "📦 Building React application for production..." -ForegroundColor Blue
    Set-Location frontend
    
    # Set production environment
    $env:NODE_ENV = "production"
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

function Deploy-Backend {
    Write-Host "🚀 Deploying backend to AWS server..." -ForegroundColor Blue
    
    # Copy JAR file to server
    Write-Host "📤 Uploading JAR file..." -ForegroundColor Yellow
    scp -i $KEY_FILE_PATH "ELMS\target\ELMS-0.0.1-SNAPSHOT.jar" "${SERVER_USER}@${AWS_SERVER_IP}:~/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ JAR file uploaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload JAR file!" -ForegroundColor Red
        exit 1
    }
    
    # Deploy and run on server
    Write-Host "🏃 Starting application on server..." -ForegroundColor Blue
    
    $commands = @"
pkill -f "ELMS-0.0.1-SNAPSHOT.jar" || true
sleep 3
export DB_HOST=localhost
export DB_USERNAME=elms_user
export DB_PASSWORD=$DB_PASSWORD
export SPRING_PROFILES_ACTIVE=aws
nohup java -jar ELMS-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
sleep 5
if pgrep -f "ELMS-0.0.1-SNAPSHOT.jar" > /dev/null; then
    echo "✅ Application started successfully!"
    echo "📄 Logs available at: ~/app.log"
else
    echo "❌ Application failed to start. Check logs:"
    tail -20 app.log
fi
"@
    
    ssh -i $KEY_FILE_PATH "${SERVER_USER}@${AWS_SERVER_IP}" $commands
}

function Deploy-Frontend {
    Write-Host "🌐 Deploying frontend to AWS server..." -ForegroundColor Blue
    
    # Create frontend directory on server
    ssh -i $KEY_FILE_PATH "${SERVER_USER}@${AWS_SERVER_IP}" "mkdir -p ~/frontend"
    
    # Upload frontend files
    Write-Host "📤 Uploading frontend files..." -ForegroundColor Yellow
    scp -r -i $KEY_FILE_PATH "frontend\dist\*" "${SERVER_USER}@${AWS_SERVER_IP}:~/frontend/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend files uploaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload frontend files!" -ForegroundColor Red
        exit 1
    }
    
    # Setup frontend serving
    Write-Host "🖥️ Setting up frontend serving..." -ForegroundColor Blue
    
    $frontendCommands = @"
pkill -f "http.server" || true
if ! command -v serve &> /dev/null; then
    npm install -g serve || echo "⚠️ Could not install serve globally, using Python instead"
fi
cd ~/frontend
if command -v serve &> /dev/null; then
    nohup serve -s . -l 80 > frontend.log 2>&1 &
    echo "✅ Frontend served using 'serve' on port 80"
else
    nohup python3 -m http.server 80 > frontend.log 2>&1 &
    echo "✅ Frontend served using Python on port 80"
fi
sleep 3
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend is accessible!"
else
    echo "❌ Frontend may not be accessible. Check logs:"
    tail -10 frontend.log
fi
"@
    
    ssh -i $KEY_FILE_PATH "${SERVER_USER}@${AWS_SERVER_IP}" $frontendCommands
}

function Test-Deployment {
    Write-Host "🧪 Testing deployment..." -ForegroundColor Blue
    
    # Test backend
    Write-Host "Testing backend API..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://${AWS_SERVER_IP}:8080/api/employees/register" -TimeoutSec 10 -UseBasicParsing
        Write-Host "✅ Backend API is responding!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend API is not responding!" -ForegroundColor Red
    }
    
    # Test frontend
    Write-Host "Testing frontend..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://${AWS_SERVER_IP}" -TimeoutSec 10 -UseBasicParsing
        Write-Host "✅ Frontend is responding!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Frontend is not responding!" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🌐 Access your application:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://${AWS_SERVER_IP}" -ForegroundColor White
    Write-Host "   API: http://${AWS_SERVER_IP}:8080" -ForegroundColor White
}

function Show-Menu {
    Write-Host ""
    Write-Host "Select deployment option:" -ForegroundColor Cyan
    Write-Host "1) Full deployment (build + deploy both frontend & backend)" -ForegroundColor White
    Write-Host "2) Deploy backend only" -ForegroundColor White
    Write-Host "3) Deploy frontend only" -ForegroundColor White
    Write-Host "4) Build only (no deployment)" -ForegroundColor White
    Write-Host "5) Test current deployment" -ForegroundColor White
    Write-Host "6) View server logs" -ForegroundColor White
    Write-Host "7) Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice [1-7]"
    
    switch ($choice) {
        "1" {
            Test-KeyFile
            Build-Backend
            Build-Frontend
            Deploy-Backend
            Deploy-Frontend
            Test-Deployment
            Show-Menu
        }
        "2" {
            Test-KeyFile
            Build-Backend
            Deploy-Backend
            Show-Menu
        }
        "3" {
            Test-KeyFile
            Build-Frontend
            Deploy-Frontend
            Show-Menu
        }
        "4" {
            Build-Backend
            Build-Frontend
            Write-Host "✅ Build completed!" -ForegroundColor Green
            Show-Menu
        }
        "5" {
            Test-Deployment
            Show-Menu
        }
        "6" {
            Test-KeyFile
            Write-Host "📄 Viewing server logs..." -ForegroundColor Blue
            ssh -i $KEY_FILE_PATH "${SERVER_USER}@${AWS_SERVER_IP}" "echo '=== Application Logs ==='; tail -50 app.log; echo ''; echo '=== Frontend Logs ==='; tail -20 frontend.log"
            Show-Menu
        }
        "7" {
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
Write-Host "⚠️  IMPORTANT: Before running this script, make sure to:" -ForegroundColor Yellow
Write-Host "   1. Update KEY_FILE_PATH variable with your SSH key path" -ForegroundColor White
Write-Host "   2. Update DB_PASSWORD variable with your database password" -ForegroundColor White
Write-Host "   3. Ensure your AWS security groups allow ports 80 and 8080" -ForegroundColor White
Write-Host "   4. Install SSH client (OpenSSH) and SCP if not available" -ForegroundColor White
Write-Host ""

Show-Menu