#!/bin/bash

# ELMS Docker Deployment for AWS Server 16.170.210.109
# Run this script on your AWS server

echo "🐳 ELMS Docker Deployment Starting..."
echo "===================================="

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🔧 Installing Docker..."
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
    echo "✅ Docker installed successfully!"
    echo "⚠️  Please run 'newgrp docker' or logout/login for group changes to take effect"
else
    echo "✅ Docker is already installed"
fi

# Pull the latest images
echo "📥 Pulling Docker images from DockerHub..."
docker pull dilshan019/elms-backend:latest
docker pull dilshan019/elms-frontend:latest
docker pull mysql:8.0

# Create docker-compose.yml
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: elms-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword123
      MYSQL_DATABASE: empdb
      MYSQL_USER: elms_user
      MYSQL_PASSWORD: elms_password123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - elms-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5
      interval: 30s

  # Backend Service
  backend:
    image: dilshan019/elms-backend:latest
    container_name: elms-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: empdb
      DB_USERNAME: elms_user
      DB_PASSWORD: elms_password123
      SPRING_PROFILES_ACTIVE: aws
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - elms-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/employees/register" || exit 1]
      timeout: 10s
      retries: 5
      interval: 30s
      start_period: 60s

  # Frontend Service
  frontend:
    image: dilshan019/elms-frontend:latest
    container_name: elms-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - elms-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost" || exit 1]
      timeout: 10s
      retries: 3
      interval: 30s

volumes:
  mysql_data:

networks:
  elms-network:
    driver: bridge
EOF

echo "✅ docker-compose.yml created successfully!"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Start the services
echo "🚀 Starting ELMS services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo "========================"
echo "🌐 Your application should now be accessible at:"
echo "   Frontend: http://16.170.210.109"
echo "   Backend API: http://16.170.210.109:8080"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Check status: docker-compose ps"
echo ""
echo "🔍 If there are issues, check the logs with:"
echo "   docker-compose logs backend"
echo "   docker-compose logs frontend" 
echo "   docker-compose logs mysql"