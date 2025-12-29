# Environment Variables Setup

## Quick Setup

Create a `.env.local` file in the root of `buffalo-solar-admin/` with these variables:

```bash
# Firebase Configuration (Copy from buffalo-solar-website/.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Where to Get These Values

**Option 1: Copy from Website**

```bash
# From the buffalo-solar-website directory
cat .env.local | grep FIREBASE
```

Then copy the output into your admin `.env.local` file.

**Option 2: From Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Buffalo Solar project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click on your web app
6. Copy the config values

## Important Notes

- ⚠️ **Use the SAME Firebase project** as your website
- The admin needs read access to form submissions in Firestore
- Never commit `.env.local` to git (it's already in .gitignore)
- After creating/updating `.env.local`, restart your dev server

## Verification

After setting up, you can verify the connection by checking the browser console when you load the dashboard. You should see Firebase initialized without errors.
