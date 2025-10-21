# 🚀 ELMS Simple CI/CD Pipeline

This document describes the simple Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Employee Leave Management System (ELMS).

## 📋 Overview

The CI/CD pipeline is built using GitHub Actions and includes:

- **Automated Testing**: Backend Maven tests and Frontend ESLint checks
- **Docker Image Building**: Automated builds and pushes to DockerHub
- **EC2 Deployment**: Automated deployment to AWS EC2 server
- **Health Checks**: Post-deployment verification

## 🔧 Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Trigger**: Push to `main` branch only

**Jobs**:
1. **test-build**: Run frontend lint + build, backend tests with MySQL
2. **docker-build**: Build and push Docker images to DockerHub
3. **deploy**: Deploy to AWS EC2 with health checks

### 2. Pull Request Checks (`pr-checks.yml`)

**Trigger**: Pull Request events

**Jobs**:
- **pr-quality-gate**: Code quality, build verification, and Docker build tests
- **pr-comment**: Automated PR status comments

## 🔑 Required GitHub Secrets

Add these secrets to your GitHub repository settings:

```
DOCKERHUB_PASSWORD=your_dockerhub_password
EC2_SSH_KEY=your_ec2_private_key_content
```

## � Pipeline Flow

```
Push to main branch
       ↓
   Test & Build
   - Frontend: npm ci, lint, build
   - Backend: Maven tests with MySQL
       ↓
   Docker Build & Push
   - Backend: dilshan019/elms-backend:latest
   - Frontend: dilshan019/elms-frontend:latest
       ↓
   Deploy to EC2
   - Stop old containers
   - Pull latest images
   - Start new containers
   - Health checks
```

## � Deployment Details

### Environment Variables
- **Server**: 16.170.210.109
- **User**: ubuntu
- **DockerHub**: dilshan019

### Container Configuration
```bash
# Backend Container
docker run -d \
  --name elms-backend \
  --network elms-network \
  -e SPRING_PROFILES_ACTIVE=production \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://elms-database:3306/empdb \
  -p 8080:8080 \
  dilshan019/elms-backend:latest

# Frontend Container  
docker run -d \
  --name elms-frontend \
  --network elms-network \
  -p 80:80 \
  dilshan019/elms-frontend:latest
```

## 🔧 Setup Steps

1. **Configure GitHub Secrets**:
   - Go to GitHub Settings → Secrets and variables → Actions
   - Add `DOCKERHUB_PASSWORD` and `EC2_SSH_KEY`

2. **Push to Main Branch**:
   ```bash
   git add .
   git commit -m "feat: trigger deployment"
   git push origin main
   ```

3. **Monitor Deployment**:
   - Check GitHub Actions tab for pipeline status
   - Verify deployment at http://16.170.210.109

## 📱 Access Points

After successful deployment:
- **Frontend**: http://16.170.210.109
- **Backend API**: http://16.170.210.109:8080
- **Health Check**: http://16.170.210.109:8080/actuator/health

## 🧪 Testing

### Local Testing
```bash
# Frontend
cd frontend
npm ci
npm run lint
npm run build

# Backend
cd ELMS
chmod +x ./mvnw
./mvnw clean test
```

### Docker Testing
```bash
# Build images locally
docker build -t elms-backend ./ELMS
docker build -t elms-frontend ./frontend
```

## 🔄 Workflow Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| Push to `main` | Main CI/CD | Full pipeline with deployment |
| Pull Request | PR Checks | Quality gates and validation |

## � Support

- **GitHub Actions**: Check workflow logs for detailed error information
- **Server Issues**: SSH to server and check container logs with `docker logs elms-backend`
- **Build Issues**: Verify Docker images on [DockerHub](https://hub.docker.com/u/dilshan019)

---

**Simple, Fast, Reliable** - Your ELMS deployment is just a git push away! 🚀