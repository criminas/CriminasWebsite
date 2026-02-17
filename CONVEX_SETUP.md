# Convex Setup Guide

This guide will walk you through setting up authentication for the Criminas website using Convex.

## Prerequisites

- Node.js and npm installed
- A GitHub account
- A Google account (for Google OAuth)

## Step 1: Deploy Convex Project

1. Run the Convex development server:
   ```bash
   npx convex dev
   ```

2. This will:
   - Open your browser to create/select a Convex project
   - Generate your deployment credentials
   - Start watching for changes

3. Copy the deployment credentials shown in the terminal. You'll need:
   - `CONVEX_DEPLOYMENT` (e.g., `dev:amazing-animal-123`)
   - `PUBLIC_CONVEX_URL` (e.g., `https://amazing-animal-123.convex.cloud`)

4. Add these to your `.env.local` file:
   ```
   CONVEX_DEPLOYMENT=dev:your-deployment-name
   PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
   ```

## Step 2: Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)

2. Click "New OAuth App"

3. Fill in the details:
   - **Application name**: Criminas
   - **Homepage URL**: `http://localhost:4321` (for development)
   - **Authorization callback URL**: Get this from your Convex dashboard under "Authentication" settings
     - It will look like: `https://YOUR_DEPLOYMENT.convex.site/api/auth/callback/github`

4. Click "Register application"

5. Copy the **Client ID** and generate a **Client Secret**

6. Add to `.env.local`:
   ```
   AUTH_GITHUB_ID=your_github_client_id
   AUTH_GITHUB_SECRET=your_github_client_secret
   ```

## Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select an existing one

3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Criminas"
   - Authorized redirect URIs:
     - Get this from your Convex dashboard under "Authentication" settings
     - It will look like: `https://YOUR_DEPLOYMENT.convex.site/api/auth/callback/google`

5. Copy the **Client ID** and **Client Secret**

6. Add to `.env.local`:
   ```
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   ```

## Step 4: Generate Auth Secret

Generate a secure random string for session encryption:

```bash
openssl rand -base64 32
```

Add it to `.env.local`:
```
AUTH_SECRET=your_generated_secret
```

## Step 5: Deploy Environment Variables to Convex

Push your environment variables to Convex:

```bash
npx convex env set AUTH_GITHUB_ID "your_github_client_id"
npx convex env set AUTH_GITHUB_SECRET "your_github_client_secret"
npx convex env set AUTH_GOOGLE_ID "your_google_client_id"
npx convex env set AUTH_GOOGLE_SECRET "your_google_client_secret"
npx convex env set AUTH_SECRET "your_generated_secret"
```

## Step 6: Start Development Server

1. Make sure Convex is running:
   ```bash
   npx convex dev
   ```

2. In a separate terminal, start the Astro development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:4321`

## Testing Authentication

1. Click the "Sign In" button in the navigation bar

2. Try signing in with GitHub or Google

3. You should be redirected back to the site with your account menu visible

4. Check that:
   - Your name and avatar appear in the account dropdown
   - You can access the Profile and Starred Projects pages
   - You can star/unstar projects
   - Sign out works correctly

## Production Deployment

When deploying to production:

1. Create a production Convex deployment:
   ```bash
   npx convex deploy
   ```

2. Update OAuth callback URLs in GitHub and Google to use your production domain:
   - GitHub: `https://yourdomain.com`
   - Google: `https://yourdomain.com`
   - Callback URLs: Update to use your production Convex deployment URL

3. Set environment variables in your hosting platform (Vercel, Netlify, etc.)

4. Update `.env.local` with production values or use platform-specific environment variable management

## Troubleshooting

### "Unauthorized" errors
- Check that all environment variables are set correctly
- Verify OAuth callback URLs match your Convex deployment
- Make sure you pushed environment variables to Convex with `npx convex env set`

### Authentication not working
- Clear browser cookies and localStorage
- Check browser console for errors
- Verify Convex is running (`npx convex dev`)
- Check that PUBLIC_CONVEX_URL is accessible

### Star button not working
- Verify you're signed in
- Check that the Convex client is initialized (window.__convex should exist)
- Look for errors in browser console

## Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
