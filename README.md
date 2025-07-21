# Darpan Education - AI-Powered International Student Platform

A comprehensive AI-powered educational platform designed to help students, experts, and administrators navigate international education opportunities. The unified platform features role-based dashboards with document analysis, scholarship matching, application management, and expert consultation services.

## 🚀 Features

### For Students
- **Document Intelligence**: AI-powered analysis of visa documents, COE certificates, and offer letters
- **Scholarship Research**: Advanced AI matching system with 24 comprehensive database tables
- **Application Management**: Smart application tracker with expert consultation integration
- **Academic Document Analysis**: Multi-AI processing with Google Cloud Vision, OpenAI, and Anthropic
- **Study Abroad Guidance**: Personalized recommendations based on comprehensive student profiles
- **Expert Consultation**: Direct booking and messaging with study abroad experts
- **Profile Management**: Comprehensive educational profiles with completion tracking

### For Study Abroad Experts
- **Student Management**: Comprehensive CRM with lead categorization and assignment tracking
- **Consultation Services**: Appointment scheduling with integrated messaging system
- **Document Review**: Access to student documents with analysis results
- **Progress Tracking**: Student journey monitoring with success probability scoring
- **Analytics Dashboard**: Expert-specific performance metrics and student success rates
- **Resource Library**: Document templates, country guides, and university database access

### For Administrators
- **Multi-Role Management**: Admin, expert, and student user management with role-based permissions
- **System Analytics**: Comprehensive platform usage statistics and performance monitoring
- **Database Management**: 24-table normalized database with multi-country support
- **Content Management**: Scholarship database, institution management, and system configuration
- **Expert Assignment**: Automated and manual student-expert matching based on specializations
- **Platform Oversight**: Complete system control with audit trails and security monitoring

## 🔐 User Roles & Access Control

### Students (`user` role)
- Access to comprehensive student dashboard with AI-powered tools
- Document analysis, scholarship research, and application management
- Expert consultation booking and messaging system
- Profile-based personalized recommendations and guidance

### Study Abroad Experts (`expert` role)
- Specialized expert dashboard for student management
- Access to assigned students with comprehensive CRM functionality
- Document review capabilities and consultation scheduling
- Progress tracking with analytics and performance metrics

### System Administrators (`admin` role)
- Full platform oversight with multi-role user management
- Database administration for 24-table comprehensive schema
- Expert assignment and student-expert relationship management
- System analytics, content management, and platform configuration

## 📋 Admin Access Management

### Creating Admin Users

#### Method 1: Database Direct (Recommended)
```sql
-- Update existing user to admin
UPDATE users SET role = 'admin', max_analyses = 999 WHERE username = 'your_username';

-- Or create new admin via registration then upgrade
-- 1. Register normally through /auth
-- 2. Then run SQL to upgrade:
UPDATE users SET role = 'admin', max_analyses = 999 WHERE username = 'new_admin_username';
```

#### Method 2: Pre-configured Admin Account
Use the existing admin account:
- **Username**: `sysadmin`
- **Password**: `admin123`
- **Access**: Full admin panel at `/admin`

### Admin Panel Features

#### User Management Dashboard
- View all registered users
- See analysis counts and limits
- Monitor user activity and registration dates
- Access detailed user profiles

#### Quota Management
- Grant additional analyses to users
- Set custom limits per user
- Track usage across the system
- Reset user quotas when needed

#### System Statistics
- Total users and analyses
- Usage patterns and trends
- Popular analysis types
- System health monitoring

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+ (configured in Replit)
- PostgreSQL 16 database (configured in Replit)
- Multi-AI API keys (OpenAI, Anthropic, DeepSeek)
- Google Cloud Vision API (optional)
- SendGrid API (optional for email)

### Environment Variables
Required environment variables:
```env
DATABASE_URL=postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
SESSION_SECRET=secure_random_session_secret
GOOGLE_CLOUD_VISION_API_KEY=optional_google_vision_key
SENDGRID_API_KEY=optional_sendgrid_key
FROM_EMAIL=optional_from_email
FRONTEND_URL=your_domain_url
```

### Installation Steps
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npm run db:push
   ```

3. **Start Application**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - User Interface: `http://localhost:5000`
   - Admin Panel: `http://localhost:5000/admin`

## 🎯 User Guide

### For Regular Users

#### Getting Started
1. Register at `/auth` with your details
2. Login to access the dashboard
3. Upload a rejection letter (PDF/JPG/PNG)
4. Review AI analysis results
5. Book consultation if needed

#### Using the Analyzer
1. **Upload Document**: Drag & drop or select file
2. **Processing**: AI extracts and analyzes text
3. **Results**: View detailed breakdown:
   - Rejection reasons with severity levels
   - Specific recommendations
   - Next steps and timeline
   - Consultation booking option

#### Managing Your Account
- **View History**: See all previous analyses
- **Track Usage**: Monitor remaining quota
- **Book Consultations**: Schedule expert sessions
- **Contact Admin**: Request additional analyses

### For Administrators

#### Accessing Admin Panel
1. Login with admin credentials
2. Automatic redirect to `/admin`
3. Use sidebar navigation for different functions

#### Managing Users
1. **View All Users**: See complete user list with statistics
2. **User Details**: Click any user for detailed profile
3. **Grant Quota**: Use "Grant Analyses" to add quota
4. **Monitor Activity**: Track user engagement and usage

#### System Administration
1. **Monitor Usage**: Track system-wide statistics
2. **Manage Quotas**: Set and adjust user limits
3. **Review Analytics**: Understand usage patterns
4. **Support Users**: Help with account issues

## 🔧 Technical Architecture

### Frontend (`client/`)
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching
- **shadcn/ui** components
- **Tailwind CSS** styling

### Backend (`server/`)
- **Express.js** server
- **Passport.js** authentication
- **Drizzle ORM** database
- **OpenAI API** integration
- **Multer** file uploads

### Database Schema
```sql
-- Users table
users (
  id, username, email, password,
  full_name, qualification, graduation_year, phone_number,
  role, analysis_count, max_analyses, created_at
)

-- Analyses table  
analyses (
  id, user_id, file_name, analysis_results,
  created_at, is_public
)

-- Appointments table
appointments (
  id, user_id, full_name, email, phone_number,
  preferred_date, message, status, created_at
)
```

## 🚨 Security Features

- **Password Hashing**: Secure scrypt-based encryption
- **Session Management**: Server-side session storage
- **Role-Based Access**: Strict admin/user separation
- **Input Validation**: Zod schema validation
- **File Type Checking**: Safe file upload handling
- **SQL Injection Prevention**: Parameterized queries

## 📊 API Endpoints

### Public Routes
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### User Routes (Authenticated)
- `POST /api/analyze` - Upload and analyze document
- `GET /api/analyses` - Get user's analyses
- `GET /api/analyses/:id` - Get specific analysis
- `POST /api/appointments` - Book consultation
- `GET /api/appointments` - Get user appointments

### Admin Routes (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id/max-analyses` - Update user quota

## 🔍 Troubleshooting

### Common Issues

#### Authentication Problems
- Check username/password spelling
- Verify account role assignment
- Clear browser cookies/session
- Check database user records

#### File Upload Issues
- Ensure file is PDF, JPG, or PNG
- Check file size limits
- Verify OpenAI API key
- Check network connectivity

#### Admin Access Problems
- Verify admin role in database
- Check admin route protection
- Ensure proper session handling
- Confirm admin credentials

### Database Management
```sql
-- Check user roles
SELECT username, role, analysis_count, max_analyses FROM users;

-- Reset user quota
UPDATE users SET analysis_count = 0 WHERE username = 'username';

-- Grant admin access
UPDATE users SET role = 'admin', max_analyses = 999 WHERE username = 'username';

-- Check analysis history
SELECT u.username, COUNT(a.id) as total_analyses 
FROM users u 
LEFT JOIN analyses a ON u.id = a.user_id 
GROUP BY u.id, u.username;
```

## 📈 Usage Analytics

The admin panel provides comprehensive analytics:
- User registration trends
- Analysis usage patterns
- Popular document types
- Consultation booking rates
- System performance metrics

## 🎨 Customization

### Styling
- Modify `client/src/index.css` for global styles
- Update `tailwind.config.ts` for theme changes
- Customize components in `client/src/components/ui/`

### Business Logic
- Analysis prompts in `server/openai.ts`
- User limits in database schema
- Email templates for notifications
- Consultation workflow in routes

## 🚀 Deployment

### Production Setup
1. Set production environment variables
2. Build the application: `npm run build`
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database backups
6. Monitor application logs

### Replit Deployment
- Use Replit's built-in deployment
- Configure environment secrets
- Set up custom domain if needed
- Monitor via Replit dashboard

## 📞 Support

For technical support or admin access requests:
1. Contact system administrator
2. Submit support ticket
3. Check documentation first
4. Provide detailed error descriptions

---

---

## 🤖 EduCounsel AI System Prompt

The EduCounsel AI uses the following system prompt for personalized educational guidance:

```
You are Darpan Intelligence, an international education advisor. Provide concise, personalized guidance.

STUDENT: [Student Name] | [Field of Study] | [Preferred Countries]
SCHOLARSHIPS: [Relevant scholarships if available]

GUIDELINES:
- Be concise yet comprehensive (max 100 words)
- Personalize using student profile
- Cover: academics, costs, career prospects, cultural fit
- Reference available scholarships when relevant
- Suggest actionable next steps
- Maintain professional counseling standards

Respond naturally and helpfully.
```

### AI Features:
- **Triple AI Fallback**: DeepSeek → OpenAI GPT-4o-mini → Anthropic Claude
- **Cost Optimization**: Response caching, rate limiting, smart database queries
- **Conversation Memory**: Context-aware responses using recent message history
- **Profile Integration**: Personalized responses based on student profile data
- **Database Context**: Real-time scholarship and country data integration

---

**Last Updated**: July 2025  
**Version**: 2.0.0 - Comprehensive Multi-Role Platform  
**License**: Private Use Only