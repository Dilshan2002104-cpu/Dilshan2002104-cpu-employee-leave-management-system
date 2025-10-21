# 🚀 ELMS CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Employee Leave Management System (ELMS).

## 📋 Overview

The CI/CD pipeline is built using GitHub Actions and includes:

- **Automated Testing**: Unit tests, integration tests, and code quality checks
- **Security Scanning**: Vulnerability scanning for dependencies and containers
- **Docker Image Building**: Automated builds and pushes to DockerHub
- **AWS Deployment**: Automated deployment to AWS EC2 instances
- **Release Management**: Automated releases with versioned artifacts

## 🔧 Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Trigger**: Push to `main` or `develop` branches, Pull Requests to `main`

**Jobs**:
- `backend-test`: Run Spring Boot tests with MySQL
- `frontend-test`: ESLint checks and build validation
- `security-scan`: Trivy vulnerability scanning
- `docker-build`: Build and push Docker images (main branch only)
- `deploy`: Deploy to AWS EC2 (main branch only)
- `notify`: Send deployment notifications

### 2. Pull Request Validation (`pr-validation.yml`)

**Trigger**: Pull Request events (opened, synchronize, reopened)

**Jobs**:
- `code-quality`: Code style, security, and build checks
- `test-coverage`: Generate test coverage reports
- `build-validation`: Validate Docker builds without pushing
- `pr-comment`: Post validation results as PR comments

### 3. Dependency Updates (`dependency-updates.yml`)

**Trigger**: Weekly schedule (Mondays 9 AM UTC) or manual

**Jobs**:
- `update-backend-dependencies`: Update Maven dependencies
- `update-frontend-dependencies`: Update NPM dependencies  
- `security-audit`: Check for security vulnerabilities

### 4. Release Management (`release.yml`)

**Trigger**: Git tag push (format: `v*.*.*`)

**Jobs**:
- `create-release`: Create GitHub release with changelog
- `build-and-test`: Full build and test suite
- `release-images`: Build and push versioned Docker images
- `update-release`: Add deployment artifacts to release

## 🔑 Required Secrets

Add these secrets to your GitHub repository settings:

### Docker Hub
```
DOCKER_PASSWORD=your_dockerhub_password
```

### AWS Deployment
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
EC2_SSH_PRIVATE_KEY=your_ec2_private_key_content
EC2_HOSTNAME=16.170.210.109
```

### Optional (for enhanced features)
```
CODECOV_TOKEN=your_codecov_token
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## 🚀 Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed above

### EC2 SSH Private Key Setup
```bash
# 1. Copy your private key content
cat /path/to/your/private-key.pem

# 2. Copy the entire output (including -----BEGIN/END----- lines)
# 3. Paste into GitHub secret EC2_SSH_PRIVATE_KEY
```

## 🔄 Branch Strategy

### Main Branch
- **Protected**: Requires PR reviews
- **Auto-deploy**: Pushes trigger production deployment
- **Docker tags**: `latest` + SHA-based tags

### Develop Branch  
- **Integration**: Feature branch merges here first
- **Testing**: Full test suite runs
- **No auto-deploy**: Manual testing environment

### Feature Branches
- **Validation**: PR checks run automatically
- **Requirements**: Must pass all checks before merge

## 📊 Monitoring & Notifications

### Deployment Status
- ✅ **Success**: Application health checks pass
- ❌ **Failure**: Automatic rollback triggers
- 📧 **Notifications**: Team alerts via configured channels

### Security Alerts
- **Vulnerability scanning**: Weekly automated scans
- **Dependency updates**: Automatic PR creation
- **Security issues**: High-priority GitHub issues created

## 🐳 Docker Images

Images are automatically built and pushed to DockerHub:

### Backend
```
docker pull dilshan019/elms-backend:latest
docker pull dilshan019/elms-backend:v1.0.0  # version tag
```

### Frontend
```
docker pull dilshan019/elms-frontend:latest
docker pull dilshan019/elms-frontend:v1.0.0  # version tag
```

## 🏗️ Local Development

### Running Tests Locally
```bash
# Backend tests
cd ELMS
mvn clean test

# Frontend tests
cd frontend
npm install
npm run lint
npm run build
```

### Building Docker Images Locally
```bash
# Backend
docker build -t elms-backend ./ELMS

# Frontend  
docker build -t elms-frontend ./frontend

# Full stack
docker-compose up -d
```

## 📦 Creating Releases

### Automatic Release Process
1. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Run full test suite
   - Build Docker images with version tags
   - Create GitHub release with changelog
   - Upload deployment artifacts

### Release Artifacts
Each release includes:
- **Source code** (automatic)
- **Docker images** (versioned)
- **Deployment package** (docker-compose + scripts)
- **Generated changelog**

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Build Fails
```bash
# Check Dockerfile syntax
docker build --no-cache -t test-image .

# Check for file permissions
ls -la Dockerfile
```

#### 2. AWS Deployment Fails
```bash
# Test SSH connection
ssh -i private-key.pem ubuntu@16.170.210.109

# Check security group settings
# Ensure ports 8080, 3000, 22 are open
```

#### 3. Test Failures
```bash
# Run tests with detailed output
mvn test -X  # Backend
npm test -- --verbose  # Frontend
```

### Debugging Workflows

1. **Check workflow logs** in GitHub Actions tab
2. **Review failed job steps** for specific errors
3. **Check secret configuration** if authentication fails
4. **Verify branch protection rules** if PRs are blocked

## 📚 Best Practices

### Code Quality
- ✅ Write comprehensive tests
- ✅ Follow ESLint rules for frontend
- ✅ Use proper commit message format
- ✅ Keep dependencies updated

### Security
- 🔒 Regular dependency updates
- 🔒 Container image scanning
- 🔒 Secret management best practices
- 🔒 Branch protection rules

### Deployment
- 🚀 Zero-downtime deployments
- 🚀 Health check validations
- 🚀 Automatic rollback on failure
- 🚀 Environment-specific configurations

## 📞 Support

For issues with the CI/CD pipeline:
1. Check this documentation first
2. Review workflow logs in GitHub Actions
3. Create an issue in the repository
4. Tag relevant team members for urgent issues

---

**Note**: This CI/CD setup is designed for a Spring Boot + React application with MySQL database, deployed to AWS EC2 using Docker containers.