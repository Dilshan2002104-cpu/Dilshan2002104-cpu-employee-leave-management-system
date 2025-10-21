@echo off
echo 🚀 ELMS AWS Deployment Helper
echo =============================

:menu
echo.
echo Select an option:
echo 1) Check environment
echo 2) Build backend only
echo 3) Build frontend only
echo 4) Build both frontend and backend
echo 5) Create full deployment package
echo 6) Exit
echo.
set /p choice=Enter your choice [1-6]: 

if "%choice%"=="1" goto check_env
if "%choice%"=="2" goto build_backend_only
if "%choice%"=="3" goto build_frontend_only
if "%choice%"=="4" goto build_both
if "%choice%"=="5" goto create_package
if "%choice%"=="6" goto exit
echo ❌ Invalid option. Please try again.
goto menu

:check_env
echo 🔍 Checking environment setup...

java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed! Please install Java 17+
    pause
    goto menu
) else (
    echo ✅ Java is installed
)

node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed! Please install Node.js
    pause
    goto menu
) else (
    echo ✅ Node.js is installed
)

if exist "ELMS\mvnw.cmd" (
    echo ✅ Maven wrapper found
) else (
    echo ❌ Maven wrapper not found!
    pause
    goto menu
)

echo ✅ Environment check completed!
pause
goto menu

:build_backend_only
call :check_env_silent
echo 📦 Building Spring Boot application...
cd ELMS
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo ❌ Backend build failed!
    pause
    cd ..
    goto menu
) else (
    echo ✅ Backend build successful!
    echo 📄 JAR file location: ELMS\target\ELMS-0.0.1-SNAPSHOT.jar
)
cd ..
pause
goto menu

:build_frontend_only
call :check_env_silent
echo 📦 Building React application...
cd frontend

if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
)

call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    cd ..
    goto menu
) else (
    echo ✅ Frontend build successful!
    echo 📄 Build files location: frontend\dist\
)
cd ..
pause
goto menu

:build_both
call :check_env_silent
echo 📦 Building both frontend and backend...

echo Building backend...
cd ELMS
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo ❌ Backend build failed!
    pause
    cd ..
    goto menu
)
cd ..

echo Building frontend...
cd frontend
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
)
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    cd ..
    goto menu
)
cd ..

echo ✅ Both builds completed successfully!
pause
goto menu

:create_package
call :check_env_silent
echo 📦 Creating deployment package...

REM Build backend
echo Building backend...
cd ELMS
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo ❌ Backend build failed!
    pause
    cd ..
    goto menu
)
cd ..

REM Build frontend
echo Building frontend...
cd frontend
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
)
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    cd ..
    goto menu
)
cd ..

REM Create deployment directory
if not exist "deployment" mkdir deployment

REM Copy files
copy "ELMS\target\ELMS-0.0.1-SNAPSHOT.jar" "deployment\"
if not exist "deployment\frontend-build" mkdir "deployment\frontend-build"
xcopy "frontend\dist\*" "deployment\frontend-build\" /E /I /Y
copy "AWS_DEPLOYMENT_GUIDE.md" "deployment\"

echo ✅ Deployment package created in 'deployment\' directory
echo.
echo 🎉 Deployment package ready!
echo 📁 Check the 'deployment\' directory for all files
echo 📖 Read AWS_DEPLOYMENT_GUIDE.md for deployment instructions
pause
goto menu

:check_env_silent
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed! Please install Java 17+
    pause
    goto menu
)

node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed! Please install Node.js
    pause
    goto menu
)

if not exist "ELMS\mvnw.cmd" (
    echo ❌ Maven wrapper not found!
    pause
    goto menu
)
goto :eof

:exit
echo 👋 Goodbye!
pause
exit