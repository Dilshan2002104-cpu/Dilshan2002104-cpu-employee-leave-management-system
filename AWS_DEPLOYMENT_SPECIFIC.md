# ELMS AWS Deployment Guide - Server IP: 16.170.210.109

## Quick Deployment Steps

### 📋 Prerequisites on AWS Server (16.170.210.109)
1. **Java 17+** installed
2. **MySQL Server** running
3. **Node.js and npm** (for serving frontend)
4. **Security Group** configured to allow:
   - Port 8080 (Spring Boot API)
   - Port 80/443 (Frontend)
   - Port 3306 (MySQL - only from application server)

### 🗄️ Database Setup
1. **Connect to your AWS server**:
   ```bash
   ssh -i your-key.pem ec2-user@16.170.210.109
   ```

2. **Setup MySQL database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE empdb;
   CREATE USER 'elms_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON empdb.* TO 'elms_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### 🚀 Backend Deployment

1. **Build the Spring Boot application**:
   ```bash
   cd ELMS
   ./mvnw clean package -DskipTests
   ```

2. **Copy JAR to AWS server**:
   ```bash
   scp -i your-key.pem ELMS/target/ELMS-0.0.1-SNAPSHOT.jar ec2-user@16.170.210.109:~/
   ```

3. **Run on AWS server**:
   ```bash
   # SSH into the server
   ssh -i your-key.pem ec2-user@16.170.210.109
   
   # Set environment variables (update with your actual database credentials)
   export DB_HOST=localhost
   export DB_USERNAME=elms_user
   export DB_PASSWORD=your_secure_password
   export SPRING_PROFILES_ACTIVE=aws
   
   # Run the application
   nohup java -jar ELMS-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
   ```

### 🌐 Frontend Deployment

1. **Build frontend for production** (already configured for your server):
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy frontend build to AWS server**:
   ```bash
   scp -r -i your-key.pem frontend/dist/* ec2-user@16.170.210.109:~/frontend/
   ```

3. **Serve frontend** (on AWS server):
   ```bash
   # Option 1: Using Python (simple)
   cd ~/frontend
   python3 -m http.server 80
   
   # Option 2: Using Node.js serve package
   npm install -g serve
   serve -s ~/frontend -l 80
   
   # Option 3: Using nginx (recommended for production)
   sudo yum install nginx
   sudo cp -r ~/frontend/* /var/www/html/
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### 🔧 Current Configuration

**Frontend API Configuration**:
- Development: `http://localhost:8080`
- Production: `http://16.170.210.109:8080`

**Backend Configuration**:
- Server IP: `0.0.0.0` (listens on all interfaces)
- Port: `8080`
- Database: MySQL on same server

### 🔐 Security Group Configuration (AWS Console)

Ensure your EC2 security group allows:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Frontend access (SSL) |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | API access |
| SSH | TCP | 22 | Your IP | Server management |
| MySQL/Aurora | TCP | 3306 | Security Group ID | Database access |

### 🧪 Testing the Deployment

1. **Test Backend API**:
   ```bash
   curl http://16.170.210.109:8080/api/employees/login
   ```

2. **Test Frontend**:
   - Open browser: `http://16.170.210.109`

3. **Test Full Flow**:
   - Register a new employee
   - Login and submit a leave request
   - Check department head dashboard

### 📝 Environment Variables for Production

Create a `.env` file on your AWS server:

```bash
# /home/ec2-user/.env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=empdb
DB_USERNAME=elms_user
DB_PASSWORD=your_secure_password
SPRING_PROFILES_ACTIVE=aws
```

Then run with:
```bash
source .env && java -jar ELMS-0.0.1-SNAPSHOT.jar
```

### 🔄 Service Setup (Optional - for auto-restart)

Create a systemd service:

```bash
sudo nano /etc/systemd/system/elms.service
```

```ini
[Unit]
Description=Employee Leave Management System
After=mysql.service

[Service]
Type=simple
User=ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/ELMS-0.0.1-SNAPSHOT.jar
Restart=always
Environment=SPRING_PROFILES_ACTIVE=aws
Environment=DB_HOST=localhost
Environment=DB_USERNAME=elms_user
Environment=DB_PASSWORD=your_secure_password

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable elms
sudo systemctl start elms
sudo systemctl status elms
```

### 🚨 Troubleshooting

**Common Issues**:

1. **Connection Refused**:
   - Check if Java application is running: `ps aux | grep java`
   - Check logs: `tail -f app.log`

2. **Database Connection Failed**:
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check credentials and database exists

3. **CORS Errors**:
   - Verify frontend is using correct API URL
   - Check browser network tab for actual requests

4. **Port Already in Use**:
   ```bash
   sudo netstat -tulpn | grep :8080
   sudo kill -9 <PID>
   ```

### 📊 Monitoring

**Check Application Status**:
```bash
# Backend
curl http://16.170.210.109:8080/api/employees/register

# Frontend
curl http://16.170.210.109/

# Logs
tail -f app.log
journalctl -u elms -f
```

### 🎯 Next Steps

1. **SSL Certificate**: Set up HTTPS using Let's Encrypt
2. **Domain Name**: Configure a proper domain name
3. **Load Balancer**: Add Application Load Balancer for high availability
4. **Database**: Move to AWS RDS for better reliability
5. **Monitoring**: Set up CloudWatch monitoring

### 📞 Access URLs

- **Frontend**: http://16.170.210.109
- **API Base**: http://16.170.210.109:8080
- **Health Check**: http://16.170.210.109:8080/api/employees/register

Your application is now configured and ready for deployment on AWS server `16.170.210.109`! 🚀