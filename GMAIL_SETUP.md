# Gmail App Password Setup for Email Invitations

## Overview

The admin center sends invitation emails using Gmail's SMTP server with an App Password. This is simple, free, and requires no external services like SendGrid.

---

## Step 1: Enable 2-Factor Authentication on Gmail

Before you can create an App Password, you must have 2-Factor Authentication enabled on your Gmail account.

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the steps to enable 2FA if it's not already enabled

---

## Step 2: Generate an App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate to: Google Account → Security → 2-Step Verification → App passwords

2. You may be asked to sign in again

3. Under "Select app", choose **"Mail"**

4. Under "Select device", choose **"Other (Custom name)"**

5. Enter a name like **"Buffalo Solar Admin Center"**

6. Click **"Generate"**

7. Google will show you a 16-character password like: `xxxx xxxx xxxx xxxx`

8. **Copy this password** (you won't be able to see it again!)

---

## Step 3: Add to Environment Variables

Add these variables to your `.env.local` file:

```env
# Gmail App Password for Email Invitations
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Important:**
- Use the Gmail address you want to send emails FROM
- Use the 16-character app password (with or without spaces - both work)
- Keep this file secure and never commit it to Git

---

## Step 4: Test Email Configuration

The system will automatically attempt to send emails when you invite admins. To test:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to Settings → Admin Management

3. Invite a test email address

4. Check if you receive the invitation email

5. Check the console/terminal for any error messages

---

## Troubleshooting

### "Invalid login" or "Authentication failed"

**Causes:**
- App password is incorrect
- 2FA is not enabled
- Using your regular Gmail password instead of app password

**Solutions:**
- Regenerate a new app password
- Make sure 2FA is enabled
- Double-check the password in `.env.local`

### Emails not sending

**Check:**
1. Environment variables are set correctly
2. Server has been restarted after adding env vars
3. Gmail account is not blocked or limited
4. Check server console for detailed error messages

### "Daily sending limit exceeded"

Gmail free accounts have limits:
- **500 emails per day** for regular Gmail accounts
- If you exceed this, wait 24 hours or upgrade to Google Workspace

---

## Email Template

The invitation email includes:
- ✅ Buffalo Solar branding
- ✅ Personalized greeting
- ✅ Invitation details
- ✅ Accept button with secure link
- ✅ Expiration notice (24 hours)
- ✅ Professional HTML design

Example email preview:

```
☀️ Buffalo Solar
Admin Center

You've Been Invited!

Hi there,

admin@buffalosolar.com has invited you to join the Buffalo Solar Admin Center.

Your invitation email: newadmin@buffalosolar.com

As an admin, you'll be able to:
• Manage form submissions and leads
• View analytics and reports
• Manage content and files
• Invite other team members

[Accept Invitation Button]

Note: This invitation will expire in 24 hours.
```

---

## Security Best Practices

1. **Use a dedicated email** - Consider creating `noreply@buffalosolar.com` for system emails

2. **Rotate app passwords** - Regenerate periodically for security

3. **Monitor usage** - Check Gmail's sent folder for any unusual activity

4. **Limit access** - Only share the app password with authorized developers

5. **Revoke if compromised** - Delete the app password from Google Account settings immediately if exposed

---

## For Production

### Recommended: Use Google Workspace

If sending many emails, consider:
- **Google Workspace** (formerly G Suite)
- Higher sending limits (2,000/day)
- Professional email address (`@buffalosolar.com`)
- Better deliverability
- Cost: ~$6/user/month

### Setup with Custom Domain

1. **Set up Google Workspace** with your domain

2. **Create a system account:**
   - Email: `noreply@buffalosolar.com` or `admin@buffalosolar.com`

3. **Generate app password** for this account

4. **Update environment variables:**
   ```env
   GMAIL_USER=noreply@buffalosolar.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

---

## Alternative: Other Email Services

If you prefer not to use Gmail, you can easily adapt the code for:

### Outlook/Office 365
```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});
```

### SendGrid (if you prefer)
```bash
npm install @sendgrid/mail
```

### AWS SES, Mailgun, etc.
All work with nodemailer - just update the transport configuration.

---

## Environment Variables Checklist

Make sure these are set in `.env.local`:

```env
# Required for email invitations
✅ GMAIL_USER=your-email@gmail.com
✅ GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Required for proper links in emails
✅ NEXT_PUBLIC_APP_URL=http://localhost:3000
   # In production: https://admin.buffalosolar.com
```

---

## Testing Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App password generated
- [ ] Environment variables added to `.env.local`
- [ ] Server restarted
- [ ] Test invitation sent
- [ ] Invitation email received
- [ ] Invitation link works
- [ ] No errors in console

---

## Support

If emails still aren't working:

1. **Check Gmail settings:**
   - "Less secure app access" should be OFF (we're using app password, not less secure apps)
   - Check "Filters and Blocked Addresses" for any blocks

2. **Check server logs:**
   - Look for nodemailer errors in terminal
   - Check for authentication failures

3. **Test SMTP connection:**
   ```bash
   # In server console
   curl -v --url 'smtps://smtp.gmail.com:465' --user 'your-email@gmail.com:your-app-password'
   ```

4. **Verify environment variables loaded:**
   - Add `console.log(process.env.GMAIL_USER)` temporarily
   - Should show your email, not `undefined`

---

**Last Updated:** Nov 26, 2025  
**Version:** 1.0

