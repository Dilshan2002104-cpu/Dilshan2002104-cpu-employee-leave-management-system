# Employee Leave Management System (ELMS) - AWS Deployment Guide

## Overview
This is a full-stack Employee Leave Management System built with Spring Boot (backend) and React (frontend), now configured for AWS deployment.

## Architecture
- **Backend**: Spring Boot 3.5.0 (Java 17)
- **Frontend**: React.js with Vite
- **Database**: MySQL (AWS RDS recommended for production)

## Environment Configuration

### Frontend Environment Variables
The frontend now uses environment-specific configuration:

**Development (.env.development)**
```
VITE_API_BASE_URL=http://localhost:8080
```

**Production (.env.production)**
```
VITE_API_BASE_URL=https://your-aws-server.com
```

### Backend Environment Variables
For AWS deployment, set these environment variables:

```bash
# Database Configuration
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_NAME=empdb
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

# Spring Profile
SPRING_PROFILES_ACTIVE=aws
```

## AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for beginners)

#### Backend Deployment
1. **Build the JAR file**:
   ```bash
   cd ELMS
   ./mvnw clean package
   ```

2. **Create Elastic Beanstalk Application**:
   - Go to AWS Elastic Beanstalk console
   - Create new application
   - Choose Java platform
   - Upload the JAR file from `target/ELMS-0.0.1-SNAPSHOT.jar`

3. **Configure Environment Variables**:
   - Set database connection variables
   - Set `SPRING_PROFILES_ACTIVE=aws`

#### Frontend Deployment
1. **Update environment file**:
   ```bash
   # In frontend/.env.production
   VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com
   ```

2. **Build and deploy**:
   ```bash
   cd frontend
   npm run build
   ```
   
3. **Deploy to S3 + CloudFront**:
   - Upload `dist/` folder to S3 bucket
   - Enable static website hosting
   - Set up CloudFront distribution

### Option 2: AWS EC2 with Docker

#### Create Dockerfile for Backend
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/ELMS-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

#### Create Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Option 3: AWS ECS (Container Service)

1. **Build and push Docker images to ECR**
2. **Create ECS cluster**
3. **Deploy both frontend and backend containers**

## Database Setup

### AWS RDS MySQL Setup
1. Create RDS MySQL instance
2. Configure security groups to allow access from your EC2/ECS
3. Create database `empdb`
4. Update connection variables in your deployment environment

### Local Database (for testing)
```sql
CREATE DATABASE empdb;
```

## API Endpoints

The application exposes these REST endpoints:

### Employee Management
- `POST /api/employees/register` - Employee registration
- `POST /api/employees/login` - Employee authentication

### Leave Management  
- `POST /api/leaves/submit` - Submit leave request
- `GET /api/leaves/by-employee/{id}` - Get employee's leave history
- `GET /api/leaves/all` - Get all leave requests
- `PUT /api/leaves/update-status/{id}` - Update leave request status

### Department Head Management
- `POST /api/heads/login` - Department head login
- `GET /api/heads/all-heads` - Get all department heads
- `POST /api/heads/create` - Create department head

## Security Configuration

- **CORS**: Configured to accept requests from any origin for AWS deployment
- **Authentication**: BCrypt password encoding
- **API Security**: All endpoints are currently public (consider implementing JWT for production)

## Running Locally

### Backend
```bash
cd ELMS
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Considerations

1. **Security**: Implement proper authentication (JWT tokens)
2. **Database**: Use AWS RDS for production database
3. **SSL**: Enable HTTPS for production deployment
4. **Environment Variables**: Never commit sensitive data to version control
5. **Monitoring**: Set up CloudWatch for monitoring and logging
6. **Backup**: Configure automated database backups

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure frontend environment variable points to correct backend URL
2. **Database Connection**: Verify RDS security groups and connection parameters
3. **Build Failures**: Check Java version (requires Java 17+)

### Logs
- Backend logs: Available in Elastic Beanstalk console or CloudWatch
- Frontend: Check browser console for errors

## Cost Optimization
- Use t3.micro instances for development
- Consider AWS Free Tier resources
- Set up auto-scaling for production loads
- Use S3 for static asset hosting