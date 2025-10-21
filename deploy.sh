#!/bin/bash

# ELMS AWS Deployment Helper Script

echo "🚀 ELMS AWS Deployment Helper"
echo "============================="

# Function to build backend
build_backend() {
    echo "📦 Building Spring Boot application..."
    cd ELMS
    ./mvnw clean package -DskipTests
    if [ $? -eq 0 ]; then
        echo "✅ Backend build successful!"
        echo "📄 JAR file location: ELMS/target/ELMS-0.0.1-SNAPSHOT.jar"
    else
        echo "❌ Backend build failed!"
        exit 1
    fi
    cd ..
}

# Function to build frontend
build_frontend() {
    echo "📦 Building React application..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful!"
        echo "📄 Build files location: frontend/dist/"
    else
        echo "❌ Frontend build failed!"
        exit 1
    fi
    cd ..
}

# Function to check environment setup
check_environment() {
    echo "🔍 Checking environment setup..."
    
    # Check if Java is installed
    if command -v java &> /dev/null; then
        echo "✅ Java is installed: $(java -version 2>&1 | head -n 1)"
    else
        echo "❌ Java is not installed! Please install Java 17+"
        exit 1
    fi
    
    # Check if Node.js is installed
    if command -v node &> /dev/null; then
        echo "✅ Node.js is installed: $(node -v)"
    else
        echo "❌ Node.js is not installed! Please install Node.js"
        exit 1
    fi
    
    # Check if Maven wrapper exists
    if [ -f "ELMS/mvnw" ]; then
        echo "✅ Maven wrapper found"
    else
        echo "❌ Maven wrapper not found!"
        exit 1
    fi
}

# Function to create deployment package
create_deployment_package() {
    echo "📦 Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy backend JAR
    cp ELMS/target/ELMS-0.0.1-SNAPSHOT.jar deployment/
    
    # Copy frontend build
    cp -r frontend/dist deployment/frontend-build
    
    # Copy deployment guide
    cp AWS_DEPLOYMENT_GUIDE.md deployment/
    
    echo "✅ Deployment package created in 'deployment/' directory"
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Check environment"
    echo "2) Build backend only"
    echo "3) Build frontend only"
    echo "4) Build both frontend and backend"
    echo "5) Create full deployment package"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice [1-6]: " choice
    
    case $choice in
        1)
            check_environment
            show_menu
            ;;
        2)
            check_environment
            build_backend
            show_menu
            ;;
        3)
            check_environment
            build_frontend
            show_menu
            ;;
        4)
            check_environment
            build_backend
            build_frontend
            show_menu
            ;;
        5)
            check_environment
            build_backend
            build_frontend
            create_deployment_package
            echo ""
            echo "🎉 Deployment package ready!"
            echo "📁 Check the 'deployment/' directory for all files"
            echo "📖 Read AWS_DEPLOYMENT_GUIDE.md for deployment instructions"
            show_menu
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            show_menu
            ;;
    esac
}

# Start the script
show_menu