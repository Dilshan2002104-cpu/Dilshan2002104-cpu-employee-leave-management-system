#!/bin/bash

# ELMS CI/CD Setup Validation Script
# This script helps validate your CI/CD setup before pushing to GitHub

set -e

echo "🔍 ELMS CI/CD Setup Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo ""
echo "📁 Checking project structure..."

# Check for required files
FILES=(
    ".github/workflows/ci-cd.yml"
    ".github/workflows/pr-validation.yml"
    ".github/workflows/dependency-updates.yml"
    ".github/workflows/release.yml"
    "ELMS/Dockerfile"
    "frontend/Dockerfile"
    "docker-compose.yml"
    ".env.example"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Found $file"
    else
        print_status 1 "Missing $file"
    fi
done

echo ""
echo "🔧 Checking development tools..."

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_status 0 "Java found (version: $JAVA_VERSION)"
else
    print_status 1 "Java not found"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js found (version: $NODE_VERSION)"
else
    print_status 1 "Node.js not found"
fi

# Check Maven
if command -v mvn &> /dev/null; then
    print_status 0 "Maven found"
else
    print_status 1 "Maven not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    print_status 0 "Docker found"
else
    print_status 1 "Docker not found"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    print_status 0 "Docker Compose found"
else
    print_status 1 "Docker Compose not found"
fi

echo ""
echo "📋 Validating configuration files..."

# Check pom.xml
if [ -f "ELMS/pom.xml" ]; then
    if grep -q "spring-boot-starter-parent" "ELMS/pom.xml"; then
        print_status 0 "Spring Boot configuration valid"
    else
        print_status 1 "Spring Boot configuration issues in pom.xml"
    fi
else
    print_status 1 "ELMS/pom.xml not found"
fi

# Check package.json
if [ -f "frontend/package.json" ]; then
    if grep -q "react" "frontend/package.json"; then
        print_status 0 "React configuration valid"
    else
        print_status 1 "React configuration issues in package.json"
    fi
else
    print_status 1 "frontend/package.json not found"
fi

# Check Dockerfiles
echo ""
echo "🐳 Validating Dockerfiles..."

if [ -f "ELMS/Dockerfile" ]; then
    if grep -q "openjdk:17" "ELMS/Dockerfile"; then
        print_status 0 "Backend Dockerfile using Java 17"
    else
        print_warning "Backend Dockerfile not using Java 17"
    fi
    
    if grep -q "EXPOSE 8080" "ELMS/Dockerfile"; then
        print_status 0 "Backend Dockerfile exposes port 8080"
    else
        print_status 1 "Backend Dockerfile doesn't expose port 8080"
    fi
fi

if [ -f "frontend/Dockerfile" ]; then
    if grep -q "nginx" "frontend/Dockerfile"; then
        print_status 0 "Frontend Dockerfile uses Nginx"
    else
        print_warning "Frontend Dockerfile doesn't use Nginx"
    fi
    
    if grep -q "EXPOSE 80" "frontend/Dockerfile"; then
        print_status 0 "Frontend Dockerfile exposes port 80"
    else
        print_status 1 "Frontend Dockerfile doesn't expose port 80"
    fi
fi

echo ""
echo "🧪 Running basic build tests..."

# Test backend build
if [ -d "ELMS" ] && command -v mvn &> /dev/null; then
    print_info "Testing Maven build..."
    cd ELMS
    if mvn clean compile -q; then
        print_status 0 "Backend compiles successfully"
    else
        print_status 1 "Backend compilation failed"
    fi
    cd ..
fi

# Test frontend build
if [ -d "frontend" ] && command -v npm &> /dev/null; then
    print_info "Testing NPM build..."
    cd frontend
    if npm install --silent && npm run build; then
        print_status 0 "Frontend builds successfully"
    else
        print_status 1 "Frontend build failed"
    fi
    cd ..
fi

echo ""
echo "🔍 Checking GitHub Actions workflows..."

# Check workflow syntax (basic check)
for workflow in .github/workflows/*.yml; do
    if [ -f "$workflow" ]; then
        # Check if workflow has required fields
        if grep -q "name:" "$workflow" && grep -q "on:" "$workflow" && grep -q "jobs:" "$workflow"; then
            print_status 0 "$(basename $workflow) has valid structure"
        else
            print_status 1 "$(basename $workflow) has invalid structure"
        fi
    fi
done

echo ""
echo "📝 Checking documentation..."

# Check if README exists and has basic content
if [ -f "README.md" ]; then
    if grep -q "Employee Leave Management System" "README.md"; then
        print_status 0 "README.md has project description"
    else
        print_status 1 "README.md missing project description"
    fi
    
    if grep -q "CI/CD" "README.md"; then
        print_status 0 "README.md mentions CI/CD"
    else
        print_warning "README.md should mention CI/CD setup"
    fi
fi

if [ -f "CI-CD-SETUP.md" ]; then
    print_status 0 "CI/CD documentation found"
else
    print_status 1 "CI/CD documentation missing"
fi

echo ""
echo "🔑 GitHub Secrets Checklist"
echo "============================="
print_info "Make sure you have configured these secrets in GitHub:"
echo "   - DOCKER_PASSWORD (your DockerHub password)"
echo "   - AWS_ACCESS_KEY_ID (for AWS deployment)"
echo "   - AWS_SECRET_ACCESS_KEY (for AWS deployment)"
echo "   - EC2_SSH_PRIVATE_KEY (your EC2 private key content)"
echo "   - EC2_HOSTNAME (your EC2 instance IP)"

echo ""
echo "🚀 Next Steps"
echo "============="
print_info "If all checks pass:"
echo "   1. Commit and push your changes to GitHub"
echo "   2. Create a Pull Request to test PR validation"
echo "   3. Merge to main branch to trigger deployment"
echo "   4. Create a release tag (e.g., v1.0.0) to test release workflow"

echo ""
print_info "To create a release:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"

echo ""
echo "✅ Validation complete!"
echo "Check any failed items above before proceeding with CI/CD setup."