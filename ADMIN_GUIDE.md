# Admin Quick Start Guide

## Immediate Access

### Pre-configured Admin Account
- **Username**: `sysadmin`
- **Password**: `admin123`
- **Access URL**: `/admin`

### Creating New Admin Users

#### Method 1: Upgrade Existing User (Recommended)
```sql
-- Connect to your database and run:
UPDATE users SET role = 'admin', max_analyses = 999 WHERE username = 'target_username';
```

#### Method 2: Register then Upgrade
1. Register normally at `/auth`
2. Run SQL command to grant admin access:
```sql
UPDATE users SET role = 'admin', max_analyses = 999 WHERE email = 'new_admin@email.com';
```

## Admin Panel Features

### User Management (`/admin`)
- **View All Users**: Complete user listing with statistics
- **Grant Quotas**: Add analysis credits to any user
- **Change Roles**: Convert users to admin or regular user
- **User Details**: Access full profiles and activity history

### Dashboard Statistics
- Total users and admin count
- System-wide analysis usage
- User registration trends
- Active user monitoring

### Quick Actions
1. **Grant Analysis Quota**:
   - Find user in table
   - Click "Grant Quota"
   - Enter number of additional analyses
   - Confirm to update

2. **Change User Role**:
   - Find user in table  
   - Click settings icon
   - Select new role (user/admin)
   - Confirm to update

3. **View User Details**:
   - Click on any username
   - See complete profile
   - Review analysis history
   - Check appointment bookings

## System Administration

### Database Management
```sql
-- View all users and roles
SELECT username, email, role, analysis_count, max_analyses, created_at FROM users;

-- Grant unlimited analyses to admin
UPDATE users SET max_analyses = 999 WHERE role = 'admin';

-- Reset user analysis count
UPDATE users SET analysis_count = 0 WHERE username = 'username';

-- Check system statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
  SUM(analysis_count) as total_analyses
FROM users;
```

### User Support Tasks

#### Grant Additional Analyses
1. User requests more quota via support
2. Admin logs into `/admin`
3. Find user in management table
4. Click "Grant Quota" button
5. Enter additional analysis count
6. User immediately gets updated quota

#### Role Management
1. Promote user to admin:
   ```sql
   UPDATE users SET role = 'admin', max_analyses = 999 WHERE username = 'username';
   ```
2. Demote admin to user:
   ```sql
   UPDATE users SET role = 'user', max_analyses = 3 WHERE username = 'username';
   ```

#### Account Issues
- **Login Problems**: Check password hash in database
- **Quota Issues**: Verify `analysis_count` vs `max_analyses`
- **Role Access**: Confirm `role` field is correct
- **Missing Data**: Check user exists in `users` table

## Security Best Practices

### Admin Account Security
- Change default admin password immediately
- Use strong passwords for all admin accounts
- Limit admin access to necessary personnel only
- Regular audit of admin user list

### System Monitoring
- Monitor admin panel access logs
- Track quota changes and user modifications
- Review user registration patterns
- Watch for unusual analysis usage

### Data Protection
- Regular database backups
- Secure environment variables
- Monitor OpenAI API usage
- Protect user privacy in admin interface

## Troubleshooting

### Common Issues

#### Cannot Access Admin Panel
1. Verify user has `role = 'admin'` in database
2. Check login session is active
3. Clear browser cache/cookies
4. Confirm admin routes are working

#### Role Updates Not Working
1. Check database connection
2. Verify SQL syntax in updates
3. Confirm user exists before update
4. Check server logs for errors

#### Quota Changes Not Reflected
1. User must refresh browser
2. Check database update was successful
3. Verify analysis count vs max analyses
4. Confirm no caching issues

### Emergency Admin Access
If locked out of admin panel:
```sql
-- Create emergency admin access
INSERT INTO users (username, email, password, full_name, role, max_analyses) 
VALUES ('emergency', 'admin@emergency.com', 'hash_password_here', 'Emergency Admin', 'admin', 999);
```

## Daily Admin Tasks

### Morning Checklist
- [ ] Check new user registrations
- [ ] Review system usage statistics  
- [ ] Process quota increase requests
- [ ] Monitor analysis success rates

### Weekly Tasks
- [ ] User activity analysis
- [ ] System performance review
- [ ] Database maintenance
- [ ] Admin access audit

### Monthly Tasks
- [ ] User engagement reports
- [ ] System capacity planning
- [ ] Security review
- [ ] Admin training updates

## Support Workflows

### User Requests More Analyses
1. User contacts support
2. Admin verifies account
3. Grant additional quota via admin panel
4. Confirm with user

### User Cannot Login
1. Check user exists in database
2. Verify email/username spelling
3. Reset password if needed
4. Check account is not disabled

### System Performance Issues
1. Check database performance
2. Monitor OpenAI API response times
3. Review server resources
4. Analyze user load patterns

## Integration Points

### OpenAI API Management
- Monitor API usage and costs
- Track analysis success rates
- Review prompt effectiveness
- Manage rate limits

### Database Health
- Regular backups
- Performance optimization
- Storage monitoring
- Query analysis

### User Communication
- Support ticket system
- Email notifications
- System announcements
- Usage alerts

---

**For Technical Support**: Contact system administrator
**For Urgent Issues**: Use emergency admin access procedures
**Documentation Updated**: June 2025