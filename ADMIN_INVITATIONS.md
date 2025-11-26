# Admin Invitation System

## Overview

The admin center now has a complete invitation system that allows existing admins to invite new admins. New admins receive an invitation link, accept it, complete their profile, and gain access to the admin center.

---

## How It Works

### 1. **Invite Flow**

```
Existing Admin → Invites user@email.com
    ↓
System creates invitation in Firestore
    ↓
System creates pending admin record
    ↓
Invitation link generated
    ↓
New admin clicks link → /accept-invite/TOKEN
    ↓
New admin enters name & password
    ↓
Account created & activated
    ↓
Welcome to the team!
```

---

## For Existing Admins: Inviting Someone

### Step 1: Navigate to Admin Management
1. Click **Settings** in the sidebar
2. Click **Admin Management**
3. Or go directly to `/settings/admins`

### Step 2: Send Invitation
1. Enter the new admin's email address
2. Click **Send Invite**
3. Copy the invitation link
4. Share it with the new admin (via email, Slack, etc.)

**Note:** In production, this will be sent automatically via email. For now, you need to share the link manually.

---

## For New Admins: Accepting an Invitation

### Step 1: Click the Invitation Link
The link looks like: `https://admin.buffalosolar.com/accept-invite/abc123...`

Or check your email for the invitation with a big "Accept Invitation" button.

### Step 2: Choose How to Sign Up
You'll see two options:
- **Sign up with Google** - Quick, use your Google account
- **Sign up with Email** - Create a password

### Step 3: Complete Onboarding
After signing up, you'll go through a modern onboarding flow:
1. Welcome screen with admin benefits
2. Enter your full name and role (optional)
3. Complete!

### Step 4: Access the Dashboard
You'll be automatically logged in and redirected to the dashboard!

---

## Technical Details

### Database Structure (Firestore)

**Collection: `admins`**
```typescript
{
  id: string;
  email: string;
  name?: string;
  role: "admin" | "super_admin";
  status: "pending" | "active";
  invitedBy?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: `invitations`**
```typescript
{
  id: string;
  email: string;
  token: string;
  invitedBy: string;
  expiresAt: Date; // 7 days from creation
  used: boolean;
  createdAt: Date;
}
```

---

### Files Created

**Admin Management:**
- `src/lib/admin.ts` - Admin utility functions
- `src/app/settings/admins/page.tsx` - Admin management UI
- `src/app/accept-invite/[token]/page.tsx` - Invitation acceptance page
- `src/app/api/admins/invite/route.ts` - API to create invitations

**Updated Files:**
- `src/lib/types.ts` - Added Admin and Invitation types
- `src/contexts/AuthContext.tsx` - Now checks Firestore for admins
- `src/app/settings/page.tsx` - Added link to admin management

---

## Authentication Flow

The system now checks THREE places for authorization:

1. **Hardcoded whitelist** (`src/lib/auth-whitelist.ts`)
   - Initial admins (you)
   - Always have access

2. **Firestore `admins` collection with `status: "active"`**
   - Invited admins who accepted
   - Have full access

3. **Firestore `invitations` collection with `used: false`**
   - Pending invitations
   - Can register but not fully active yet

---

## Security Features

✅ **Invitation Expiry:** Invitations expire after 7 days  
✅ **One-time Use:** Each invitation can only be used once  
✅ **Email Validation:** Only invited emails can register  
✅ **Token-based:** Secure unique tokens for each invitation  
✅ **Status Tracking:** Pending vs Active admin status  

---

## Setting Up Email Notifications (Future)

Currently, invitation links must be shared manually. To enable automatic emails:

### Option 1: Using SendGrid

1. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

2. **Add environment variable:**
```env
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@buffalosolar.com
GOOGLE_APP_PASSWORD="ysve sicg nlug jzwu"
```

3. **Update API route:**
```typescript
// src/app/api/admins/invite/route.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL!,
  subject: 'You've been invited to Buffalo Solar Admin Center',
  html: `
    <h2>Welcome to Buffalo Solar Admin Center!</h2>
    <p>You've been invited to join as an admin.</p>
    <a href="${inviteLink}">Accept Invitation</a>
  `,
});
```

### Option 2: Using Resend

1. **Install Resend:**
```bash
npm install resend
```

2. **Similar setup with Resend API**

---

## Initial Setup

### 1. Add Your Email to Whitelist

Edit `src/lib/auth-whitelist.ts`:

```typescript
export const ALLOWED_ADMIN_EMAILS: string[] = [
  "youremail@buffalosolar.com",
];
```

### 2. Create Your Account
1. Visit `/register`
2. Sign up with your whitelisted email
3. You're now a super admin!

### 3. Invite Other Admins
1. Go to Settings → Admin Management
2. Invite team members
3. Share invitation links

---

## Managing Admins

### View All Admins
Navigate to **Settings → Admin Management** to see:
- ✅ **Active admins** (green badge)
- ⏳ **Pending admins** (yellow badge) - haven't accepted yet
- Email addresses
- Names (if set)

### Admin Roles

**Admin:**
- Can access admin center
- Can invite other admins
- Standard permissions

**Super Admin:** (future feature)
- All admin permissions
- Can remove admins
- Can change roles

---

## Troubleshooting

### "This email is not authorized"
**Cause:** Email is not in whitelist AND has no pending invitation  
**Solution:** Get an invitation from an existing admin

### "Invalid invitation"
**Causes:**
- Link expired (>7 days old)
- Already used
- Invalid token

**Solution:** Request a new invitation

### "Invitation already used"
**Cause:** This email already accepted  
**Solution:** Use the login page instead of accept-invite

### Can't see Admin Management link
**Cause:** May not have necessary permissions  
**Solution:** Check that you're logged in with an admin account

---

## Future Enhancements

Planned improvements:
- [ ] Automatic email sending (SendGrid/Resend)
- [ ] Admin role management (promote to super admin)
- [ ] Remove/deactivate admins
- [ ] Resend invitations
- [ ] Invitation history/audit log
- [ ] Bulk invitations
- [ ] Custom invitation messages
- [ ] Admin activity logs

---

## API Reference

### POST `/api/admins/invite`

**Request:**
```json
{
  "email": "newadmin@buffalosolar.com",
  "invitedBy": "currentadmin@buffalosolar.com"
}
```

**Response:**
```json
{
  "success": true,
  "invitationId": "abc123",
  "inviteLink": "https://admin.buffalosolar.com/accept-invite/token123",
  "message": "Invitation sent successfully"
}
```

**Errors:**
- `400` - User already admin or has pending invitation
- `500` - Server error

---

## Security Best Practices

1. **Only invite trusted individuals** - Admins have full access
2. **Share links securely** - Use encrypted channels
3. **Monitor admin list regularly** - Review who has access
4. **Remove inactive admins** - (feature coming soon)
5. **Use strong passwords** - Enforce min 6 characters (currently)

---

## Support

For issues or questions:
- Check Firestore console for admin/invitation records
- Review browser console for client-side errors
- Check API logs for server-side errors

---

**Last Updated:** Nov 26, 2025  
**Version:** 1.0

