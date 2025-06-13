# Visa Rejection Analyzer - Complete Documentation

A comprehensive web application that analyzes visa rejection letters using AI to provide detailed insights, recommendations, and consultation booking services.

## 🚀 Features

### For Regular Users
- **Document Analysis**: Upload PDF, JPG, or PNG rejection letters for AI-powered analysis
- **Smart Insights**: Get detailed rejection reasons, recommendations, and next steps
- **Usage Limits**: 3 free analyses per user account
- **Analysis History**: View all previous analyses and results
- **Consultation Booking**: Schedule appointments with visa experts
- **Usage Tracking**: Monitor remaining analysis quota

### For Administrators
- **User Management**: View all users, their analysis counts, and account details
- **Quota Management**: Grant additional analyses to individual users
- **System Monitoring**: Track usage statistics and user activity
- **User Details**: Access comprehensive user profiles and analysis history
- **Appointment Management**: View and manage consultation bookings

## 🔐 User Roles & Access Control

### Regular Users (`user` role)
- Access to visa analysis dashboard
- Limited to 3 analyses by default
- Can book consultations
- Cannot access admin functionality

### System Administrators (`admin` role)
- Full system access and control
- User management capabilities
- Unlimited analysis quota
- Separate admin interface
- Cannot access user dashboard (role separation)

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
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
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

**Last Updated**: June 2025  
**Version**: 1.0.0  
**License**: Private Use Only