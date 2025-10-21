#!/bin/bash

# ELMS Docker Deployment Script for AWS Server
# This script should be run on the AWS server (16.170.210.109)

echo "🐳 ELMS Docker Deployment on AWS Server"
echo "======================================="

# Configuration - UPDATED VALUES
DOCKERHUB_USERNAME="dilshan019"               # Your actual DockerHub username
MYSQL_ROOT_PASSWORD="rootpassword123"         # Updated password
MYSQL_PASSWORD="elms_password123"             # Updated password

# Image names
BACKEND_IMAGE="$DOCKERHUB_USERNAME/elms-backend:latest"
FRONTEND_IMAGE="$DOCKERHUB_USERNAME/elms-frontend:latest"

# Function to install Docker
install_docker() {
    echo "📦 Installing Docker and Docker Compose..."
    
    # Update package list
    sudo apt update
    
    # Install Docker
    sudo apt install -y docker.io docker-compose
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "✅ Docker installed successfully!"
    echo "⚠️  Please log out and log back in for group changes to take effect."
}

# Function to check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        echo "✅ Docker is installed"
        docker --version
    else
        echo "❌ Docker is not installed"
        read -p "Do you want to install Docker? (y/n): " install_choice
        if [[ $install_choice == "y" || $install_choice == "Y" ]]; then
            install_docker
            echo "Please re-run this script after logging out and back in."
            exit 0
        else
            echo "Docker is required. Exiting."
            exit 1
        fi
    fi
}

# Function to pull Docker images
pull_images() {
    echo "📥 Pulling Docker images from DockerHub..."
    
    echo "Pulling backend image: $BACKEND_IMAGE"
    docker pull $BACKEND_IMAGE
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend image pulled successfully!"
    else
        echo "❌ Failed to pull backend image!"
        exit 1
    fi
    
    echo "Pulling frontend image: $FRONTEND_IMAGE"
    docker pull $FRONTEND_IMAGE
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend image pulled successfully!"
    else
        echo "❌ Failed to pull frontend image!"
        exit 1
    fi
}

# Function to create docker-compose file
create_docker_compose() {
    echo "📝 Creating docker-compose.yml..."
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: elms-mysql
    environment:
      MYSQL_ROOT_PASSWORD: $MYSQL_ROOT_PASSWORD
      MYSQL_DATABASE: empdb
      MYSQL_USER: elms_user
      MYSQL_PASSWORD: $MYSQL_PASSWORD
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - elms-network
    restart: unless-stopped

  # Backend Service
  backend:
    image: $BACKEND_IMAGE
    container_name: elms-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: empdb
      DB_USERNAME: elms_user
      DB_PASSWORD: $MYSQL_PASSWORD
      SPRING_PROFILES_ACTIVE: aws
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - elms-network
    restart: unless-stopped

  # Frontend Service
  frontend:
    image: $FRONTEND_IMAGE
    container_name: elms-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - elms-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  elms-network:
    driver: bridge
EOF

    echo "✅ docker-compose.yml created successfully!"
}

# Function to start services
start_services() {
    echo "🚀 Starting ELMS services..."
    
    # Stop any existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Services started successfully!"
        echo ""
        echo "🌐 Your application is now running:"
        echo "   Frontend: http://16.170.210.109"
        echo "   Backend API: http://16.170.210.109:8080"
        echo ""
        echo "📊 Check service status:"
        docker-compose ps
    else
        echo "❌ Failed to start services!"
        exit 1
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping ELMS services..."
    docker-compose down
    echo "✅ Services stopped!"
}

# Function to view logs
view_logs() {
    echo "📄 Viewing application logs..."
    echo ""
    echo "Select which logs to view:"
    echo "1) All services"
    echo "2) Backend only"
    echo "3) Frontend only"
    echo "4) MySQL only"
    read -p "Enter choice [1-4]: " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f mysql ;;
        *) echo "Invalid choice" ;;
    esac
}

# Function to update application
update_application() {
    echo "🔄 Updating application..."
    
    # Pull latest images
    pull_images
    
    # Restart services with new images
    docker-compose down
    docker-compose up -d
    
    echo "✅ Application updated successfully!"
}

# Function to show status
show_status() {
    echo "📊 ELMS Application Status:"
    echo "=========================="
    
    echo ""
    echo "🐳 Container Status:"
    docker-compose ps
    
    echo ""
    echo "💾 Disk Usage:"
    docker system df
    
    echo ""
    echo "🌐 Port Status:"
    sudo netstat -tulpn | grep -E ":80|:8080|:3306"
    
    echo ""
    echo "🔗 Access URLs:"
    echo "   Frontend: http://16.170.210.109"
    echo "   Backend: http://16.170.210.109:8080"
}

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    
    read -p "This will remove stopped containers, unused networks, and dangling images. Continue? (y/n): " cleanup_choice
    
    if [[ $cleanup_choice == "y" || $cleanup_choice == "Y" ]]; then
        docker system prune -f
        echo "✅ Cleanup completed!"
    else
        echo "Cleanup cancelled."
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Deploy application (pull images and start)"
    echo "2) Start services"
    echo "3) Stop services"
    echo "4) Restart services"
    echo "5) Update application (pull latest images)"
    echo "6) View logs"
    echo "7) Show status"
    echo "8) Cleanup Docker resources"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
    
    case $choice in
        1)
            check_docker
            if [ "$DOCKERHUB_USERNAME" == "your-dockerhub-username" ]; then
                echo "❌ Please update DOCKERHUB_USERNAME in this script!"
                read -p "Enter your DockerHub username: " DOCKERHUB_USERNAME
                BACKEND_IMAGE="$DOCKERHUB_USERNAME/elms-backend:latest"
                FRONTEND_IMAGE="$DOCKERHUB_USERNAME/elms-frontend:latest"
            fi
            pull_images
            create_docker_compose
            start_services
            show_menu
            ;;
        2)
            start_services
            show_menu
            ;;
        3)
            stop_services
            show_menu
            ;;
        4)
            echo "🔄 Restarting services..."
            docker-compose restart
            echo "✅ Services restarted!"
            show_menu
            ;;
        5)
            update_application
            show_menu
            ;;
        6)
            view_logs
            show_menu
            ;;
        7)
            show_status
            show_menu
            ;;
        8)
            cleanup
            show_menu
            ;;
        9)
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
echo "🖥️  Server: 16.170.210.109"
echo "📋 Configuration:"
echo "   DockerHub Username: $DOCKERHUB_USERNAME"
echo "   Backend Image: $BACKEND_IMAGE"
echo "   Frontend Image: $FRONTEND_IMAGE"

if [ "$DOCKERHUB_USERNAME" == "your-dockerhub-username" ]; then
    echo ""
    echo "⚠️  WARNING: Please update the DOCKERHUB_USERNAME variable in this script!"
fi

show_menu