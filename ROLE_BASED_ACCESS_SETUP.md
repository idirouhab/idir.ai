# Role-Based Access Control Setup Guide

This guide explains how to set up and use the role-based access control system for your blog admin panel.

## Overview

The system supports two roles:
- **Owner**: Full access (create, edit, publish, delete posts, manage users)
- **Blogger**: Limited access (create draft posts only, cannot publish)

## Database Setup

### 1. Run the Migration

Execute the SQL migration file in your Supabase dashboard:

```bash
# The migration file is located at:
supabase-migrations/001_create_users_table.sql
```

Go to Supabase Dashboard → SQL Editor → paste the contents and run it.

This will:
- Create a `users` table with role management
- Add `author_id` and `author_name` columns to `blog_posts`
- Set up Row Level Security (RLS) policies
- Create indexes for performance

### 2. Verify the Migration

Check that the tables were created:

```sql
SELECT * FROM users LIMIT 1;
SELECT author_id, author_name FROM blog_posts LIMIT 1;
```

## How It Works

### Owner Authentication (Backward Compatible)

Owners can still login using just the `ADMIN_PASSWORD`:
1. Go to `/admin/login`
2. Select "Owner" tab
3. Enter your `ADMIN_PASSWORD`

The system will automatically create an "admin" session with owner role.

### Blogger Authentication

Bloggers use email/password:
1. Go to `/admin/signup` to create an account
2. Account is created but **inactive by default**
3. Owner must approve the account at `/admin/users`
4. After approval, blogger can login at `/admin/login` (Blogger tab)

### Permission Enforcement

**Bloggers:**
- ✅ Can create blog posts
- ❌ Posts are **automatically set to draft** (cannot publish)
- ❌ Cannot access user management
- ❌ Cannot delete posts

**Owners:**
- ✅ Full access to everything
- ✅ Can publish posts
- ✅ Can manage blogger accounts
- ✅ Can review and publish blogger drafts

### API Endpoints

#### `/api/auth/signup` (POST)
Create a new blogger account (inactive by default).

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### `/api/auth/login` (POST)
Login as owner or blogger.

```json
// Owner login
{
  "password": "admin-password"
}

// Blogger login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### `/api/users` (GET) - Owner Only
List all users.

#### `/api/users` (PATCH) - Owner Only
Activate/deactivate user accounts.

```json
{
  "userId": "uuid",
  "isActive": true
}
```

#### `/api/blog` (POST)
Create a blog post. If user is a blogger, status is forced to 'draft'.

#### `/api/blog/bilingual` (POST)
Create bilingual blog posts. If user is a blogger, both posts are forced to 'draft'.

## Admin Panel Pages

### `/admin` - Dashboard
- Shows blog, events, and user management cards
- Owner sees all three sections
- Blogger sees blog and events only

### `/admin/users` - User Management (Owner Only)
- View all users
- Activate/deactivate blogger accounts
- See user roles and status

### `/admin/login` - Login Page
- Toggle between Owner and Blogger login modes
- Link to signup page for bloggers

### `/admin/signup` - Blogger Signup
- Create new blogger account
- Requires approval from owner

### `/admin/blog` - Blog Management
- All users can create posts
- Bloggers' posts are saved as drafts
- Owners can publish any draft

## Typical Workflow

1. **Blogger signs up:**
   - Goes to `/admin/signup`
   - Fills in name, email, password
   - Account created (inactive)

2. **Owner approves:**
   - Owner logs in at `/admin/login`
   - Goes to `/admin/users`
   - Clicks "Activate" on blogger's account

3. **Blogger creates content:**
   - Blogger logs in at `/admin/login` (Blogger tab)
   - Goes to `/admin/blog/new`
   - Creates post (automatically saved as draft)

4. **Owner reviews and publishes:**
   - Owner goes to `/admin/blog`
   - Reviews blogger's draft
   - Changes status to "published"

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for session management (24-hour expiry)
- HTTP-only cookies for token storage
- CSRF protection (SameSite: strict)
- Rate limiting on auth endpoints
- Row Level Security (RLS) on database
- Input validation with Zod schemas
- XSS protection (sanitization on inputs)

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Required for all functionality
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-jwt-secret
ADMIN_PASSWORD=your-admin-password

# Recommended: Strong passwords
# ADMIN_PASSWORD should be at least 12 characters
```

## Troubleshooting

### "Unauthorized" errors
- Check that JWT token is valid
- Verify SESSION_SECRET is set
- Clear cookies and try logging in again

### "Forbidden: insufficient permissions"
- User role doesn't have permission for this action
- Bloggers cannot publish posts or manage users

### Blogger can't login after signup
- Check if account is activated at `/admin/users`
- Verify `is_active` is `true` in database

### Posts not showing author information
- Run the migration to add `author_id` and `author_name` columns
- Existing posts will have `null` author fields (that's okay)

## Future Enhancements

Potential improvements:
- Email notifications for new signups
- Password reset functionality
- More granular permissions
- Audit log for user actions
- Bulk user management
- Editor role (between blogger and owner)

## Support

If you encounter issues:
1. Check database migrations are applied
2. Verify environment variables are set
3. Check browser console for errors
4. Review server logs for API errors
