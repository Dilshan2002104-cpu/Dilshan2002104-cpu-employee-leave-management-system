# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the JAR file
COPY target/ELMS-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Set environment variables with defaults
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_NAME=empdb
ENV DB_USERNAME=root
ENV DB_PASSWORD=
ENV SPRING_PROFILES_ACTIVE=aws

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]