# Role-Based Access Control - Quick Setup Guide

## Overview

Your admin panel now supports role-based access with two roles:
- **Owner**: Full access (create, edit, publish, delete posts, manage users)
- **Blogger**: Limited access (create drafts only, cannot publish)

Both roles use **email + password** authentication.

## Step 1: Run Database Migration

Execute the SQL migration in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase-migrations/001_create_users_table.sql`
5. Paste and click **Run**

This creates:
- `users` table with roles
- `author_id` and `author_name` columns in `blog_posts`
- Proper indexes and RLS policies

## Step 2: Create Your Owner Account

You have two options:

### Option A: Using the Script (Recommended)

```bash
node scripts/create-owner-simple.js
```

You'll be prompted for:
- Name
- Email
- Password

### Option B: Manually in Supabase

1. Go to Supabase Dashboard → Table Editor → `users`
2. Insert a new row:
   - `email`: your email
   - `password_hash`: (use an online bcrypt tool to hash your password)
   - `name`: your name
   - `role`: `owner`
   - `is_active`: `true`

## Step 3: Login

1. Go to `/admin/login`
2. Enter your email and password
3. You're now logged in as owner!

## How It Works

### For Owners (You):

1. Login at `/admin/login` with email + password
2. Access all features:
   - Create and publish blog posts
   - Manage live events
   - View and approve blogger accounts at `/admin/users`
   - Review and publish blogger drafts

### For Bloggers:

1. Sign up at `/admin/signup`
2. Account is created but **inactive**
3. Owner (you) approves them at `/admin/users`
4. Once approved, they can login and create drafts
5. Drafts are automatically set to "draft" status
6. Owner can review and publish their drafts

## Typical Workflow

```
Blogger Signs Up
    ↓
Owner Approves at /admin/users
    ↓
Blogger Creates Post (saved as draft)
    ↓
Owner Reviews at /admin/blog
    ↓
Owner Publishes the Draft
```

## Key Features

✅ **Unified Login**: Everyone uses email + password
✅ **Role-Based Permissions**: Automatic enforcement
✅ **Blogger Approval**: Inactive by default
✅ **Draft-Only for Bloggers**: Cannot publish
✅ **Author Tracking**: Posts track who created them
✅ **Secure**: Bcrypt hashing, JWT tokens, rate limiting

## Troubleshooting

### Can't login after creating owner account
- Make sure you ran the database migration
- Check that `is_active` is `true` in the users table
- Verify environment variables are set

### Blogger can't login
- Check if their account is activated at `/admin/users`
- Click "Activate" to enable their account

### "Missing Supabase environment variables" error
Make sure these are in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SESSION_SECRET=your-jwt-secret
```

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- Rate limiting on authentication endpoints
- HTTP-only cookies for session storage
- Row Level Security (RLS) enabled on database

## What Changed

- ✅ Login now requires email + password for all users
- ✅ No more toggle between owner/blogger modes
- ✅ Removed `ADMIN_PASSWORD` authentication
- ✅ All users stored in database with proper roles
- ✅ Bloggers must be approved before they can login
- ✅ Posts automatically track author information

## Next Steps

After setup:
1. Test logging in with your owner account
2. Try signing up as a blogger (use a different email)
3. Approve the blogger account at `/admin/users`
4. Login as the blogger and create a draft
5. Login as owner and publish the draft

That's it! Your role-based access control system is ready to use.
