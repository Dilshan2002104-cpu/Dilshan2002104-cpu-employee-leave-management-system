#!/bin/bash

# ELMS AWS Deployment Script for Server: 16.170.210.109
# Make sure to update the variables below with your actual values

echo "🚀 ELMS AWS Deployment Script"
echo "============================="
echo "Target Server: 16.170.210.109"
echo ""

# Configuration variables - UPDATE THESE
AWS_SERVER_IP="16.170.210.109"
KEY_FILE_PATH="path/to/your/key.pem"  # Update this path
SERVER_USER="ec2-user"
DB_PASSWORD="your_secure_password"    # Update this password

# Function to check if key file exists
check_key_file() {
    if [ ! -f "$KEY_FILE_PATH" ]; then
        echo "❌ SSH key file not found: $KEY_FILE_PATH"
        echo "Please update the KEY_FILE_PATH variable in this script"
        read -p "Enter path to your SSH key file: " KEY_FILE_PATH
        if [ ! -f "$KEY_FILE_PATH" ]; then
            echo "❌ Key file still not found. Exiting."
            exit 1
        fi
    fi
    chmod 400 "$KEY_FILE_PATH"
    echo "✅ SSH key file found: $KEY_FILE_PATH"
}

# Function to build backend
build_backend() {
    echo "📦 Building Spring Boot application..."
    cd ELMS
    ./mvnw clean package -DskipTests
    if [ $? -eq 0 ]; then
        echo "✅ Backend build successful!"
    else
        echo "❌ Backend build failed!"
        exit 1
    fi
    cd ..
}

# Function to build frontend
build_frontend() {
    echo "📦 Building React application for production..."
    cd frontend
    
    # Ensure we're using production environment
    export NODE_ENV=production
    
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful!"
    else
        echo "❌ Frontend build failed!"
        exit 1
    fi
    cd ..
}

# Function to deploy backend
deploy_backend() {
    echo "🚀 Deploying backend to AWS server..."
    
    # Copy JAR file to server
    echo "📤 Uploading JAR file..."
    scp -i "$KEY_FILE_PATH" ELMS/target/ELMS-0.0.1-SNAPSHOT.jar $SERVER_USER@$AWS_SERVER_IP:~/
    
    if [ $? -eq 0 ]; then
        echo "✅ JAR file uploaded successfully!"
    else
        echo "❌ Failed to upload JAR file!"
        exit 1
    fi
    
    # Deploy and run on server
    echo "🏃 Starting application on server..."
    ssh -i "$KEY_FILE_PATH" $SERVER_USER@$AWS_SERVER_IP << EOF
        # Kill existing Java processes
        pkill -f "ELMS-0.0.1-SNAPSHOT.jar" || true
        
        # Wait a moment for processes to stop
        sleep 3
        
        # Start the application
        export DB_HOST=localhost
        export DB_USERNAME=elms_user
        export DB_PASSWORD=$DB_PASSWORD
        export SPRING_PROFILES_ACTIVE=aws
        
        nohup java -jar ELMS-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
        
        # Wait a moment and check if it started
        sleep 5
        
        if pgrep -f "ELMS-0.0.1-SNAPSHOT.jar" > /dev/null; then
            echo "✅ Application started successfully!"
            echo "📄 Logs available at: ~/app.log"
        else
            echo "❌ Application failed to start. Check logs:"
            tail -20 app.log
        fi
EOF
}

# Function to deploy frontend
deploy_frontend() {
    echo "🌐 Deploying frontend to AWS server..."
    
    # Create frontend directory on server and upload files
    ssh -i "$KEY_FILE_PATH" $SERVER_USER@$AWS_SERVER_IP "mkdir -p ~/frontend"
    
    # Upload frontend files
    echo "📤 Uploading frontend files..."
    scp -r -i "$KEY_FILE_PATH" frontend/dist/* $SERVER_USER@$AWS_SERVER_IP:~/frontend/
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend files uploaded successfully!"
    else
        echo "❌ Failed to upload frontend files!"
        exit 1
    fi
    
    # Setup frontend serving
    echo "🖥️ Setting up frontend serving..."
    ssh -i "$KEY_FILE_PATH" $SERVER_USER@$AWS_SERVER_IP << 'EOF'
        # Kill existing Python servers
        pkill -f "http.server" || true
        
        # Install serve if not already installed
        if ! command -v serve &> /dev/null; then
            npm install -g serve || echo "⚠️ Could not install serve globally, using Python instead"
        fi
        
        # Start frontend server
        cd ~/frontend
        if command -v serve &> /dev/null; then
            nohup serve -s . -l 80 > frontend.log 2>&1 &
            echo "✅ Frontend served using 'serve' on port 80"
        else
            nohup python3 -m http.server 80 > frontend.log 2>&1 &
            echo "✅ Frontend served using Python on port 80"
        fi
        
        # Check if frontend is running
        sleep 3
        if curl -s http://localhost > /dev/null; then
            echo "✅ Frontend is accessible!"
        else
            echo "❌ Frontend may not be accessible. Check logs:"
            tail -10 frontend.log
        fi
EOF
}

# Function to test deployment
test_deployment() {
    echo "🧪 Testing deployment..."
    
    # Test backend
    echo "Testing backend API..."
    if curl -s "http://$AWS_SERVER_IP:8080/api/employees/register" > /dev/null; then
        echo "✅ Backend API is responding!"
    else
        echo "❌ Backend API is not responding!"
    fi
    
    # Test frontend
    echo "Testing frontend..."
    if curl -s "http://$AWS_SERVER_IP" > /dev/null; then
        echo "✅ Frontend is responding!"
    else
        echo "❌ Frontend is not responding!"
    fi
    
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://$AWS_SERVER_IP"
    echo "   API: http://$AWS_SERVER_IP:8080"
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Full deployment (build + deploy both frontend & backend)"
    echo "2) Deploy backend only"
    echo "3) Deploy frontend only"
    echo "4) Build only (no deployment)"
    echo "5) Test current deployment"
    echo "6) View server logs"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice [1-7]: " choice
    
    case $choice in
        1)
            check_key_file
            build_backend
            build_frontend
            deploy_backend
            deploy_frontend
            test_deployment
            show_menu
            ;;
        2)
            check_key_file
            build_backend
            deploy_backend
            show_menu
            ;;
        3)
            check_key_file
            build_frontend
            deploy_frontend
            show_menu
            ;;
        4)
            build_backend
            build_frontend
            echo "✅ Build completed!"
            show_menu
            ;;
        5)
            test_deployment
            show_menu
            ;;
        6)
            check_key_file
            echo "📄 Viewing server logs..."
            ssh -i "$KEY_FILE_PATH" $SERVER_USER@$AWS_SERVER_IP "echo '=== Application Logs ==='; tail -50 app.log; echo ''; echo '=== Frontend Logs ==='; tail -20 frontend.log"
            show_menu
            ;;
        7)
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
echo "⚠️  IMPORTANT: Before running this script, make sure to:"
echo "   1. Update KEY_FILE_PATH variable with your SSH key path"
echo "   2. Update DB_PASSWORD variable with your database password"
echo "   3. Ensure your AWS security groups allow ports 80 and 8080"
echo ""
show_menu