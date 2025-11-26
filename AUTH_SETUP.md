# Authentication Setup for Buffalo Solar Admin Center

## Overview

The admin center now has authentication using Firebase Auth with:
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Email whitelist (only authorized emails can register/login)
- ✅ Protected routes

---

## Quick Start

### 1. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication → Sign-in method**
4. Enable **Google** sign-in provider
5. Add your app's domain to authorized domains (localhost is already there by default)

### 2. Add Authorized Email Addresses

Edit `src/lib/auth-whitelist.ts` and add allowed email addresses:

```typescript
export const ALLOWED_ADMIN_EMAILS = [
  "admin@buffalosolar.com",
  "lisa@buffalosolar.com",
  "yourteam@buffalosolar.com",
];
```

**Only these emails can:**
- Create accounts (register)
- Sign in (login)
- Access the admin center

---

## How It Works

### Email Whitelist

The whitelist is checked:
1. **On Registration:** Email must be in whitelist to create account
2. **On Login:** Email must be in whitelist to sign in
3. **On Google Sign-In:** After Google auth, email is checked - if not allowed, user is signed out immediately

### Protected Routes

All pages except `/login` and `/register` are protected:
- Unauthenticated users are redirected to `/login`
- Authentication state is managed globally via AuthContext
- Sidebar only shows for authenticated users

### User Flow

```
┌─────────────┐
│ Visit /     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Authenticated?  │
└────┬────────┬───┘
     NO       YES
     │        │
     ▼        ▼
┌─────────┐  ┌──────────┐
│ /login  │  │Dashboard │
└─────────┘  └──────────┘
```

---

## Pages

### `/login` - Sign In Page
- Email/Password form
- Google Sign-In button
- Link to register page

### `/register` - Sign Up Page
- Email/Password registration (min 6 chars)
- Google Sign-Up button
- Email whitelist checked
- Link to login page

### Protected Pages
All other routes require authentication:
- `/` - Dashboard
- `/forms` - Forms management
- `/analytics` - Analytics
- `/files` - File management
- `/reports` - Reports
- `/settings` - Settings
- `/profile` - Profile

---

## Files Created/Modified

### New Files
- `src/lib/auth-whitelist.ts` - Email whitelist
- `src/contexts/AuthContext.tsx` - Auth context provider
- `src/components/ProtectedRoute.tsx` - Route protection wrapper
- `src/components/LayoutContent.tsx` - Conditional layout rendering
- `src/app/register/page.tsx` - Registration page

### Modified Files
- `src/lib/firebase.ts` - Added Firebase Auth initialization
- `src/app/login/page.tsx` - Connected to Firebase Auth
- `src/app/layout.tsx` - Wrapped with AuthProvider
- `src/components/app-sidebar.tsx` - Connected logout button
- `src/app/page.tsx` - Wrapped with ProtectedRoute

---

## Testing

### Test Login Flow

1. **Register a new user:**
   - Add your email to whitelist
   - Visit `/register`
   - Create account with email/password
   - Should redirect to dashboard

2. **Test email whitelist:**
   - Try registering with email NOT in whitelist
   - Should show error: "This email is not authorized..."

3. **Test Google Sign-In:**
   - Click "Sign in with Google"
   - Sign in with whitelisted Google account
   - Should redirect to dashboard

4. **Test protected routes:**
   - Sign out
   - Try visiting `/` or `/forms`
   - Should redirect to `/login`

5. **Test logout:**
   - Sign in
   - Click "Logout" in sidebar
   - Should redirect to `/login`

---

## Adding New Allowed Emails

**Step 1:** Edit `src/lib/auth-whitelist.ts`

```typescript
export const ALLOWED_ADMIN_EMAILS = [
  "existing@buffalosolar.com",
  "newperson@buffalosolar.com", // Add new email here
];
```

**Step 2:** Commit and push changes

**Step 3:** User can now register/login with that email

---

## Environment Variables

Make sure these Firebase env vars are set (already configured):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Security Notes

- ✅ **Email whitelist prevents unauthorized access**
- ✅ **Firebase handles password hashing**
- ✅ **Authentication state synced across tabs**
- ✅ **Protected routes redirect to login**
- ⚠️ **Whitelist is in code** - consider moving to database for dynamic management

---

## Troubleshooting

### "This email is not authorized" error
- Check if email is in `auth-whitelist.ts`
- Email check is case-insensitive
- Make sure to commit/deploy changes

### Google Sign-In not working
- Enable Google provider in Firebase Console
- Check that authorized domains include your deployment domain
- Verify Firebase config environment variables

### User redirected to login immediately after signing in
- Check browser console for errors
- Verify Firebase Auth is enabled in console
- Check if email is actually in whitelist

### Can't logout
- Check browser console for errors
- Verify Firebase Auth connection
- Try clearing browser cache/cookies

---

## Future Enhancements

Potential improvements:
- [ ] Move whitelist to Firestore for dynamic management
- [ ] Add role-based access control (admin, editor, viewer)
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add "Remember me" functionality
- [ ] Add session timeout
- [ ] Add audit log for authentication events

---

## Support

For issues or questions:
- Check Firebase Console for authentication logs
- Review browser console for client-side errors
- Check Network tab for failed API calls

---

**Last Updated:** Nov 26, 2025  
**Version:** 1.0

