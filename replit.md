# Visa Rejection Analyzer - Replit Configuration

## Overview

A comprehensive AI-powered web application that analyzes visa rejection letters and provides strategic guidance for improving future applications. The platform features complete role-based access control with separate user and admin interfaces.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theme
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL with connect-pg-simple
- **File Processing**: 
  - PDF text extraction using pdf-parse
  - Image OCR using Tesseract.js
  - Multer for file upload handling
- **AI Integration**: OpenAI API for document analysis

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: 
  - Users table with extended profile fields for educational consultation
  - Analyses table for storing document analysis results
  - Appointments table for consultation bookings
  - Sessions table for authentication (auto-created)

## Key Components

### Authentication System
- **Role-based Access Control**: Strict separation between 'user' and 'admin' roles
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Multi-step Registration**: Educational profile collection during signup
- **Protected Routes**: Separate route protection for users and admins

### Document Processing Pipeline
1. **File Upload**: Accepts PDF, JPG, PNG files up to 10MB
2. **Text Extraction**: 
   - PDFs processed with pdf-parse library
   - Images processed with Tesseract.js OCR
3. **AI Analysis**: OpenAI GPT integration for rejection letter analysis
4. **Results Storage**: Structured analysis results saved to database

### User Management
- **Usage Quotas**: Configurable analysis limits per user (default: 3)
- **Profile Management**: Comprehensive educational consultation profiles
- **Analysis History**: Complete tracking of user document processing
- **Consultation Booking**: Appointment scheduling system

### Admin Panel
- **User Administration**: Complete user management with quota control
- **System Analytics**: Usage statistics and monitoring
- **Role Management**: Convert users between admin and regular roles
- **Content Management**: System announcements and settings

## Data Flow

### User Registration Flow
1. Multi-step form collects account, personal, and study preference data
2. Password hashing with scrypt for secure storage
3. Email verification workflow (SendGrid integration optional)
4. Role assignment and quota initialization

### Document Analysis Flow
1. File upload with validation and size limits
2. Text extraction based on file type
3. OpenAI API call with structured prompt
4. Response parsing and validation
5. Database storage with user association
6. Quota decrement and usage tracking

### Authentication Flow
1. Login credentials validation
2. Session creation with PostgreSQL storage
3. Role-based routing to appropriate interface
4. Protected route enforcement on both client and server

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage (configured via DATABASE_URL)
- **OpenAI API**: Document analysis (requires OPENAI_API_KEY)

### Optional Services
- **SendGrid**: Email verification (SENDGRID_API_KEY optional)
- **SMTP Server**: Alternative email service

### NPM Dependencies
- **Core**: React, Express, Drizzle ORM, Passport.js
- **File Processing**: multer, pdf-parse, tesseract.js
- **UI**: Radix UI components, Tailwind CSS
- **Utilities**: react-hook-form, zod validation, date-fns

## Deployment Strategy

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your-secure-random-string-here
SENDGRID_API_KEY=optional_sendgrid_key
FROM_EMAIL=optional_from_email
FRONTEND_URL=your_domain_url
```

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Development**: `npm run dev` (runs on port 5000)

### Database Initialization
- **Schema Push**: `npm run db:push` applies Drizzle schema
- **Admin Setup**: Pre-configured admin account (username: sysadmin, password: admin123)
- **Session Table**: Auto-created by connect-pg-simple

### Production Considerations
- Proper SESSION_SECRET generation for security
- PostgreSQL database with sufficient storage
- OpenAI API quota management
- File upload size limits and storage
- Error handling and logging

## Changelog

Changelog:
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.