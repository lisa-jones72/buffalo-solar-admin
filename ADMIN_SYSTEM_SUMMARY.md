# Buffalo Solar Admin Center - Complete System Summary

## What's Been Built

### 1. **Authentication System** ✅
- Email/Password login & registration
- Google Sign-In
- Email whitelist for initial admins
- Protected routes (all pages require auth)
- Logout functionality

### 2. **Admin Invitation System** ✅
- Invite new admins by email
- Automatic invitation emails via Gmail
- Secure tokens with 7-day expiration
- Accept invitation with Google or Email/Password
- Modern onboarding flow for first-time users

### 3. **Pages Created**
- `/login` - Sign in page
- `/register` - Sign up page  
- `/accept-invite/[token]` - Accept invitation
- `/onboarding` - First-time user profile setup
- `/settings` - Settings hub
- `/settings/admins` - Admin management (invite & view admins)

---

## Quick Start Guide

### Initial Setup (5 minutes)

**1. Add Your Email to Whitelist**

Edit: `src/lib/auth-whitelist.ts`
```typescript
export const ALLOWED_ADMIN_EMAILS: string[] = [
  "youremail@buffalosolar.com",
];
```

**2. Set Up Gmail for Invitations**

Add to `.env.local`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

[Full Gmail setup guide](GMAIL_SETUP.md)

**3. Enable Google Sign-In in Firebase**
- Firebase Console → Authentication → Sign-in method
- Enable "Google" provider

**4. Start Server & Register**
```bash
npm run dev
```
- Visit http://localhost:3000 (redirects to `/login`)
- Click "Sign up"
- Create your account → You're now an admin!

---

## How to Invite Team Members

### Step 1: Go to Admin Management
- Click **Settings** in sidebar
- Click **Admin Management**

### Step 2: Invite by Email
- Enter team member's email
- Click **Send Invite**
- Email is automatically sent! 📧

### Step 3: They Accept
Team member receives email → Clicks "Accept Invitation" → Chooses Google or Email signup → Completes onboarding → Done!

---

## User Journey

```
┌──────────────────┐
│ Admin invites    │
│ user@email.com   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Invitation email │
│ sent via Gmail   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User clicks link │
│ /accept-invite/  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Choose signup:   │
│ - Google         │
│ - Email/Password │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Onboarding:      │
│ 1. Welcome       │
│ 2. Set name/role │
│ 3. Success!      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Dashboard Access │
└──────────────────┘
```

---

## Authorization Hierarchy

The system checks authorization in this order:

1. **Hardcoded Whitelist** (`src/lib/auth-whitelist.ts`)
   - Your initial admin emails
   - Manually managed in code

2. **Firestore Active Admins** (`admins` collection, `status: "active"`)
   - Invited admins who completed onboarding
   - Managed via admin UI

3. **Pending Invitations** (`invitations` collection, `used: false`)
   - Can register but must complete onboarding first

---

## Files Structure

```
src/
├── lib/
│   ├── auth-whitelist.ts      → Initial admin emails
│   ├── admin.ts                → Admin utility functions
│   ├── email.ts                → Gmail email sending
│   └── types.ts                → Admin & Invitation types
│
├── contexts/
│   └── AuthContext.tsx         → Global auth state
│
├── components/
│   ├── ProtectedRoute.tsx      → Route protection wrapper
│   └── LayoutContent.tsx       → Conditional layout
│
├── app/
│   ├── login/page.tsx          → Sign in page
│   ├── register/page.tsx       → Sign up page
│   ├── accept-invite/[token]/  → Accept invitation
│   ├── onboarding/page.tsx     → First-time user setup
│   └── settings/
│       ├── page.tsx            → Settings hub
│       └── admins/page.tsx     → Admin management
│
└── app/api/
    └── admins/
        └── invite/route.ts     → Send invitation API
```

---

## Environment Variables Required

```env
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gmail for Invitations (NEW - required)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Application URL (NEW - required)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Features

✅ **Email whitelist** - Only authorized emails can access  
✅ **Invitation expiry** - 24 hours to accept  
✅ **One-time use tokens** - Can't reuse invitation links  
✅ **Status tracking** - Pending vs Active admins  
✅ **Secure passwords** - Firebase Auth handles hashing  
✅ **Session management** - Auto-logout, secure cookies  

---

## Testing Checklist

### Test Invitation Flow
- [ ] Invite a test email from `/settings/admins`
- [ ] Check that email was sent
- [ ] Click invitation link
- [ ] Choose signup method (Google or Email)
- [ ] Complete onboarding
- [ ] Verify redirected to dashboard
- [ ] Check Firestore - admin status should be "active"

### Test Authorization
- [ ] Try signing up with non-invited email → Should fail
- [ ] Invite email, accept, then try invitation link again → Should say "already used"
- [ ] Sign out and sign in again → Should work
- [ ] Access protected pages when logged out → Should redirect to login

---

## Common Questions

### "Can invited users choose their own password?"
Yes! They can either:
- Sign up with Google (no password needed)
- Create their own password during email signup

### "Where are admin invitations stored?"
Firestore collections:
- `admins` - All admin users
- `invitations` - Invitation tokens

### "Can I invite someone without sending email?"
Yes! If Gmail is not configured, the system will still generate the invitation link. Just copy and share it manually.

### "What happens if email sending fails?"
The invitation is still created in Firestore, and the invite link is displayed in the UI. You can copy and share it manually.

### "How do I remove an admin?"
Currently manual - delete the document from Firestore `admins` collection. Admin removal UI is planned for future.

---

## Onboarding Flow

New admins go through a beautiful 3-step onboarding:

**Step 1: Welcome**
- Shows admin benefits
- Get Started button

**Step 2: Profile**
- Enter full name (required)
- Enter role/title (optional)
- Shows their email

**Step 3: Success**
- Celebration screen
- Auto-redirect to dashboard

**Modern UI features:**
- Progress bar at top
- Smooth transitions
- Clean, minimal design
- Icons and visual hierarchy

---

## Documentation Files

- **ADMIN_INVITATIONS.md** - This file (invitation system overview)
- **GMAIL_SETUP.md** - Step-by-step Gmail app password setup
- **AUTH_SETUP.md** - General authentication documentation

---

## Next Steps

1. **Add your email to whitelist** (`src/lib/auth-whitelist.ts`)
2. **Set up Gmail app password** (see `GMAIL_SETUP.md`)
3. **Create your account** (visit `/register`)
4. **Invite your team** (visit `/settings/admins`)
5. **Start managing your admin team!**

---

## Future Enhancements

Planned features:
- [ ] Remove/deactivate admins (UI)
- [ ] Edit admin roles
- [ ] Resend invitations
- [ ] Invitation history
- [ ] Bulk invitations
- [ ] Admin activity audit log
- [ ] Role-based permissions (viewer, editor, admin, super admin)

---

**Last Updated:** Nov 26, 2025  
**Version:** 2.0 - Now with Gmail emails & modern onboarding!

