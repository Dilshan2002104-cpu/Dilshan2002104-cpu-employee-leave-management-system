# 🏢 Employee Leave Management System (ELMS)

[![CI/CD Pipeline](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/ci-cd.yml)
[![PR Validation](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/pr-validation.yml)
[![Security Scan](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/dependency-updates.yml/badge.svg)](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/actions/workflows/dependency-updates.yml)

A comprehensive Employee Leave Management System built with Spring Boot, React, and MySQL. Features automated CI/CD pipeline with Docker containerization and AWS deployment.

## 🚀 Features

### 👥 User Management
- **Employee Dashboard**: Apply for leave, view history, check balance
- **Department Head Dashboard**: Approve/reject leave requests, team overview
- **System Admin Dashboard**: Manage users, departments, system settings

### 📋 Leave Management
- Multiple leave types support
- Automated approval workflow
- Real-time status tracking
- Leave balance calculation
- Historical reporting

### 🔐 Security
- JWT-based authentication
- Role-based access control
- BCrypt password encryption
- CORS configuration

### 🐳 DevOps & Deployment
- Automated CI/CD with GitHub Actions
- Docker containerization
- AWS EC2 deployment
- Security vulnerability scanning
- Automated dependency updates

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot    │    │   MySQL         │
│   (Port 3000)   │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (Port 8080)   │    │   (Port 3306)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: Spring Boot 3.5.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Testing**: JUnit 5, Mockito

#### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

#### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Registry**: DockerHub
- **Deployment**: AWS EC2
- **Monitoring**: Application health checks

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- Docker & Docker Compose
- MySQL 8.0 (or use Docker)

### 1. Clone Repository
```bash
git clone https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system.git
cd Dilshan2002104-cpu-employee-leave-management-system
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Manual Setup

#### Backend
```bash
cd ELMS
mvn clean install
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Database
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE empdb;
CREATE USER 'elms_user'@'%' IDENTIFIED BY 'elms_password';
GRANT ALL PRIVILEGES ON empdb.* TO 'elms_user'@'%';
FLUSH PRIVILEGES;
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd ELMS
mvn test

# Frontend linting
cd frontend
npm run lint

# Frontend build
npm run build
```

### Code Quality
```bash
# Run all quality checks
./scripts/quality-check.sh

# Format code
./scripts/format-code.sh
```

## 🐳 Docker Images

Pre-built images are available on DockerHub:

```bash
# Pull latest images
docker pull dilshan019/elms-backend:latest
docker pull dilshan019/elms-frontend:latest

# Run with specific versions
docker pull dilshan019/elms-backend:v1.0.0
docker pull dilshan019/elms-frontend:v1.0.0
```

## 🚀 CI/CD Pipeline

### Automated Workflows

1. **Main Pipeline** (`ci-cd.yml`)
   - Triggered on push to main/develop
   - Runs tests, builds images, deploys to AWS
   - Includes security scanning

2. **PR Validation** (`pr-validation.yml`)
   - Code quality checks
   - Test coverage reports
   - Build validation

3. **Dependency Updates** (`dependency-updates.yml`)
   - Weekly dependency updates
   - Security vulnerability scanning
   - Automated PR creation

4. **Release Management** (`release.yml`)
   - Triggered on version tags
   - Creates releases with artifacts
   - Builds versioned Docker images

### Required Secrets

Add these to your GitHub repository secrets:

```
DOCKER_PASSWORD=your_dockerhub_password
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
EC2_SSH_PRIVATE_KEY=your_ec2_private_key_content
EC2_HOSTNAME=16.170.210.109
```

For detailed CI/CD setup, see [CI-CD-SETUP.md](./CI-CD-SETUP.md)

## 📊 API Documentation

### Authentication Endpoints
```http
POST /api/employee/login
POST /api/heads/login
```

### Employee Endpoints
```http
GET /api/employee/profile
POST /api/leave-requests
GET /api/leave-requests/employee/{employeeId}
```

### Department Head Endpoints
```http
GET /api/heads/profile
PUT /api/leave-requests/{id}/approve
PUT /api/leave-requests/{id}/reject
GET /api/heads/all
```

## 🔐 Security Features

- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control (Employee, Head, Admin)
- **Password Security**: BCrypt hashing with salt
- **CORS Protection**: Configured for production deployment
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: JPA/Hibernate with parameterized queries

## 🌐 Deployment

### AWS EC2 Deployment
```bash
# 1. SSH to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Clone and run deployment script
git clone https://github.com/your-repo/elms.git
cd elms
chmod +x aws-docker-deploy.sh
sudo ./aws-docker-deploy.sh
```

### Local Production Deployment
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using deployment script
./deploy.sh
```

## 📱 Access Points

After deployment, access the application at:

- **Frontend**: http://your-server:3000
- **Backend API**: http://your-server:8080/api
- **Health Check**: http://your-server:8080/actuator/health

### Default Credentials

**Employee Login:**
- Username: employee123
- Password: password123

**Department Head Login:**
- Username: head123
- Password: password123

## 🔧 Configuration

### Environment Variables

Key configuration options:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=empdb

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
```

### Application Properties

Located in `ELMS/src/main/resources/application.properties`:

```properties
# Database configuration
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:empdb}
spring.datasource.username=${DB_USERNAME:elms_user}
spring.datasource.password=${DB_PASSWORD:elms_password}

# JPA configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## 🧪 Testing

### Backend Testing
- **Unit Tests**: JUnit 5 with Mockito
- **Integration Tests**: Spring Boot Test with TestContainers
- **Coverage**: JaCoCo for test coverage reports

### Frontend Testing
- **Linting**: ESLint with React rules
- **Build Testing**: Vite build validation
- **Code Quality**: Automated quality checks

## 📈 Monitoring & Logging

### Application Monitoring
- **Health Checks**: Spring Boot Actuator endpoints
- **Metrics**: Application performance metrics
- **Logging**: Structured logging with configurable levels

### Infrastructure Monitoring
- **Docker Health Checks**: Container health validation
- **AWS CloudWatch**: EC2 instance monitoring
- **Uptime Monitoring**: Application availability checks

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure CI/CD pipeline passes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Dilshan Peiris
- **Repository**: [Dilshan2002104-cpu](https://github.com/Dilshan2002104-cpu)

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dilshan2002104-cpu/Dilshan2002104-cpu-employee-leave-management-system/discussions)
- **Email**: support@elms-system.com

---

⭐ **Star this repository if you find it helpful!**