# 🐳 ELMS Docker Deployment Guide

## Overview
This guide will help you containerize the ELMS application and deploy it to your AWS server using Docker and DockerHub.

## 📋 Prerequisites

### Local Machine (Windows)
- **Docker Desktop** installed and running
- **DockerHub account** (free at https://hub.docker.com)
- **Git** for version control

### AWS Server (16.170.210.109)
- **Ubuntu** server with SSH access
- **Docker** and **Docker Compose** (will be installed via script)
- **Security Groups** configured for ports 80, 8080, 3306

## 🚀 Quick Start Guide

### Step 1: Update Configuration
1. **Update DockerHub username** in `docker-build-push.ps1`:
   ```powershell
   $DockerHubUsername = "your-actual-dockerhub-username"
   ```

2. **Update DockerHub username** in `aws-docker-deploy.sh`:
   ```bash
   DOCKERHUB_USERNAME="your-actual-dockerhub-username"
   ```

### Step 2: Build and Push Images (Local Machine)
```powershell
# Run the Docker build script
.\docker-build-push.ps1

# Choose option 5: "Build and push (complete process)"
```

This will:
- ✅ Build Spring Boot JAR
- ✅ Build backend Docker image
- ✅ Build frontend Docker image  
- ✅ Push both images to DockerHub

### Step 3: Deploy to AWS Server
1. **Copy deployment script to AWS server**:
   ```bash
   scp -i "C:\Users\User\Downloads\Praveen.pem" aws-docker-deploy.sh ubuntu@16.170.210.109:~/
   ```

2. **SSH to AWS server**:
   ```bash
   ssh -i "C:\Users\User\Downloads\Praveen.pem" ubuntu@16.170.210.109
   ```

3. **Run deployment script**:
   ```bash
   chmod +x aws-docker-deploy.sh
   ./aws-docker-deploy.sh
   
   # Choose option 1: "Deploy application (pull images and start)"
   ```

### Step 4: Access Your Application
- **Frontend**: http://16.170.210.109
- **Backend API**: http://16.170.210.109:8080

## 📁 File Structure Created

```
project/
├── ELMS/
│   ├── Dockerfile              # Backend Docker configuration
│   └── target/
│       └── ELMS-0.0.1-SNAPSHOT.jar
├── frontend/
│   ├── Dockerfile              # Frontend Docker configuration
│   ├── nginx.conf              # Nginx configuration
│   └── dist/                   # Built React app
├── docker-compose.yml          # Local development
├── docker-build-push.ps1       # Build and push script (Windows)
└── aws-docker-deploy.sh        # AWS deployment script (Linux)
```

## 🔧 Detailed Commands

### Local Development with Docker Compose
```bash
# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Commands
```bash
# Build images manually
docker build -t your-username/elms-backend:latest ./ELMS
docker build -t your-username/elms-frontend:latest ./frontend

# Run backend only
docker run -d -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=yourpassword \
  your-username/elms-backend:latest

# Run frontend only
docker run -d -p 80:80 your-username/elms-frontend:latest
```

### AWS Server Management
```bash
# SSH to server
ssh -i "C:\Users\User\Downloads\Praveen.pem" ubuntu@16.170.210.109

# View running containers
docker ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Update application
docker-compose pull
docker-compose up -d

# Stop application
docker-compose down
```

## 🔐 Environment Variables

### Backend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `empdb` |
| `DB_USERNAME` | Database user | `elms_user` |
| `DB_PASSWORD` | Database password | `elms_password` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `aws` |

### Frontend Environment Variables
The frontend automatically detects the API endpoint based on build mode:
- **Development**: `http://localhost:8080`
- **Production**: `http://16.170.210.109:8080`

## 🐳 Docker Images Created

### Backend Image (`your-username/elms-backend:latest`)
- **Base Image**: `openjdk:17-jdk-slim`
- **Port**: 8080
- **Size**: ~300MB
- **Contains**: Spring Boot JAR + JRE

### Frontend Image (`your-username/elms-frontend:latest`)
- **Base Image**: `nginx:alpine`
- **Port**: 80
- **Size**: ~50MB
- **Contains**: Built React app + Nginx

## 🔍 Troubleshooting

### Common Issues

**1. Docker build fails**
```bash
# Check Docker is running
docker --version

# Clean Docker cache
docker system prune -f
```

**2. Cannot connect to database**
```bash
# Check if MySQL container is running
docker ps | grep mysql

# Check database logs
docker-compose logs mysql
```

**3. Frontend not loading**
```bash
# Check if frontend container is running
docker ps | grep frontend

# Check frontend logs
docker-compose logs frontend
```

**4. Permission denied on AWS server**
```bash
# Add user to docker group
sudo usermod -aG docker ubuntu

# Log out and log back in
exit
ssh -i "C:\Users\User\Downloads\Praveen.pem" ubuntu@16.170.210.109
```

### Health Checks
```bash
# Test backend API
curl http://16.170.210.109:8080/api/employees/register

# Test frontend
curl http://16.170.210.109

# Check all containers
docker-compose ps
```

## 🔄 Updates and Maintenance

### Updating the Application
1. **Make changes to code**
2. **Rebuild and push images**:
   ```powershell
   .\docker-build-push.ps1  # Choose option 5
   ```
3. **Update on AWS server**:
   ```bash
   ./aws-docker-deploy.sh   # Choose option 5
   ```

### Backup Database
```bash
# Create database backup
docker exec elms-mysql mysqldump -u root -prootpassword empdb > backup.sql

# Restore database backup
docker exec -i elms-mysql mysql -u root -prootpassword empdb < backup.sql
```

## 📊 Monitoring

### Container Stats
```bash
# View resource usage
docker stats

# View container details
docker inspect elms-backend
docker inspect elms-frontend
docker inspect elms-mysql
```

### Log Management
```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Save logs to file
docker-compose logs > application.log
```

## 🎯 Next Steps

1. **SSL Certificate**: Add HTTPS using Let's Encrypt
2. **Load Balancer**: Use AWS Application Load Balancer
3. **Auto-scaling**: Implement Docker Swarm or Kubernetes
4. **Monitoring**: Add Prometheus + Grafana
5. **CI/CD**: Integrate with GitHub Actions

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review container logs
3. Verify security group settings
4. Ensure all environment variables are set correctly

Your ELMS application is now fully containerized and ready for production deployment! 🚀