# Google SSO Setup Guide

This guide will help you set up Google Single Sign-On (SSO) for the admin panel.

## Prerequisites

- A Google Cloud Platform account
- Admin access to your application

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Your application name (e.g., "idir.ai Admin")
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. Skip the "Scopes" section by clicking **Save and Continue**
7. Add test users if needed (during development)
8. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure:
   - **Name**: "Admin Panel OAuth"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://idir.ai` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://idir.ai/api/auth/callback/google` (for production)
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Google OAuth (for Admin SSO)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Secret (generate a random 32+ character string)
AUTH_SECRET=your_random_secret_here
```

To generate a secure `AUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/login`

3. Click the **"Sign in with Google"** button

4. You should be redirected to Google's login page

5. After successful login, you'll be redirected to `/admin`

## How It Works

### User Registration
- When a user signs in with Google for the first time, a new user account is automatically created in your database
- New OAuth users are assigned the **"editor"** role by default
- OAuth users are automatically marked as **active** (no manual approval needed)

### User Login
- Existing users can log in with their Google account
- The system checks if the user exists and is active
- Inactive users cannot sign in

### Session Management
- Sessions are managed using NextAuth.js JWT tokens
- Session duration: 24 hours
- Users are automatically logged out after the session expires

## Security Features

1. **Dual Authentication**: Users can still use email/password OR Google SSO
2. **Role-Based Access**: OAuth users get default "editor" role
3. **Auto-Approval**: OAuth users are auto-approved (you can modify this in `lib/auth-config.ts`)
4. **Secure Sessions**: JWT-based sessions with 24-hour expiry
5. **Protected Routes**: Middleware ensures only authenticated users can access admin pages

## Customization

### Change Default Role for OAuth Users

Edit `lib/auth-config.ts` line 68:

```typescript
role: "editor", // Change to "admin", "viewer", etc.
```

### Require Manual Approval for OAuth Users

Edit `lib/auth-config.ts` line 69:

```typescript
is_active: false, // Set to false to require manual approval
```

### Adjust Session Duration

Edit `lib/auth-config.ts` line 133:

```typescript
maxAge: 24 * 60 * 60, // Change to desired seconds
```

## Troubleshooting

### Redirect URI Mismatch
- Ensure your redirect URI in Google Cloud Console exactly matches your callback URL
- Check that you've added both development and production URLs

### User Not Created
- Check your Supabase logs for errors
- Ensure the `users` table exists and has proper permissions
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Session Not Persisting
- Verify `AUTH_SECRET` is set in your environment variables
- Check browser cookies are enabled
- Ensure your domain is configured correctly in production

## Production Deployment

Before deploying to production:

1. Update Google OAuth redirect URIs with your production domain
2. Set all environment variables in your hosting platform
3. Ensure `NEXT_PUBLIC_SITE_URL` matches your production domain
4. Test the OAuth flow thoroughly
5. Consider setting `is_active: false` for OAuth users to require manual approval

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
