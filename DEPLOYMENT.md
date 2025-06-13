# Deployment Guide - Visa Rejection Analyzer

## Production Deployment

### Environment Setup

#### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI Integration
OPENAI_API_KEY=sk-your-openai-api-key

# Security
SESSION_SECRET=your-secure-random-string-here

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Setup

#### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE visa_analyzer;

-- Create user
CREATE USER visa_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE visa_analyzer TO visa_app;

-- Run migrations
npm run db:push
```

#### Initial Admin Setup
```sql
-- After deployment, create admin account
INSERT INTO users (username, email, password, full_name, role, max_analyses) 
VALUES ('admin', 'admin@yourcompany.com', 'hashed_password', 'System Administrator', 'admin', 999);
```

### Replit Deployment

#### Step 1: Configure Secrets
1. Go to Replit project settings
2. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET`: Random secure string

#### Step 2: Deploy Application
```bash
# Install dependencies
npm install

# Build production assets
npm run build

# Deploy
replit deploy
```

#### Step 3: Post-Deployment Setup
1. Access your deployed URL
2. Register admin account via `/auth`
3. Update admin role in database
4. Test all functionality

### Production Server Deployment

#### Using PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=visa_analyzer
      - POSTGRES_USER=visa_app
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Security Configuration

#### SSL/TLS Setup
```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

#### Security Headers
```nginx
# Add to Nginx configuration
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Monitoring & Maintenance

#### Health Checks
```javascript
// Add to server/routes.ts
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

#### Logging Configuration
```javascript
// Add to server/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
```

#### Caching Strategy
```javascript
// Add Redis caching
import redis from 'redis';
const client = redis.createClient();

// Cache user sessions
app.use(session({
  store: new RedisStore({ client }),
  // ... other options
}));
```

### Backup Strategy

#### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/visa_analyzer_$DATE.sql

# Keep last 30 days
find backups/ -name "*.sql" -mtime +30 -delete
```

#### File Backups
```bash
# Backup uploaded files and logs
tar -czf backups/files_$DATE.tar.gz uploads/ logs/
```

### Scaling Considerations

#### Load Balancing
```nginx
upstream app_servers {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

#### Database Scaling
- Read replicas for analytics
- Connection pooling
- Query optimization
- Regular maintenance

### Post-Deployment Checklist

#### Immediate Tasks
- [ ] Verify application loads correctly
- [ ] Test user registration and login
- [ ] Confirm admin panel access
- [ ] Test document upload and analysis
- [ ] Verify email notifications work
- [ ] Check database connectivity
- [ ] Confirm OpenAI API integration

#### Security Verification
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Admin passwords changed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] File upload permissions set

#### Performance Testing
- [ ] Load test user registration
- [ ] Test concurrent file uploads
- [ ] Verify database performance
- [ ] Check memory usage
- [ ] Monitor API response times

### Maintenance Schedule

#### Daily
- Monitor error logs
- Check system resources
- Verify backup completion
- Review API usage

#### Weekly  
- Update dependencies
- Review user feedback
- Analyze usage patterns
- Check security alerts

#### Monthly
- Full system backup
- Performance review
- Security audit
- Capacity planning

### Troubleshooting

#### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **OpenAI Errors**: Verify API key and usage limits
3. **File Upload Issues**: Check disk space and permissions
4. **Session Problems**: Verify SESSION_SECRET configuration

#### Emergency Procedures
1. Application down: Check logs, restart service
2. Database issues: Restore from backup
3. High load: Enable rate limiting
4. Security breach: Revoke sessions, audit logs

---

**Production URL**: https://your-app.replit.app  
**Admin Panel**: https://your-app.replit.app/admin  
**API Health**: https://your-app.replit.app/health