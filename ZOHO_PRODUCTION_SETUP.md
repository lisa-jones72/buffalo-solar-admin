# Zoho Campaign - Production Setup Guide
**Fast track to get automated emails working TODAY**

---

## 🎯 What We're Building

Automated emails that send based on how long a lead sits in a stage:
- 0-5 days → Email 1 (Welcome)
- 6-10 days → Email 2 (Credibility)
- 30-35 days → Email 3 (Incentive)
- 60-65 days → Email 4 (Education)
- 90+ days → Email 5 (Re-engagement)

---

## ✅ Step 1: CRM Fields (Already Done or Do Now)

**You need these 7 fields in Zoho CRM:**

1. Lead Stage (picklist)
2. Stage Entry Date (date/time)
3. Days in Stage (formula: `DateBetween(Now(), ${Leads.Stage_Entry_Date}, 'days')`)
4. Last Campaign Email (picklist)
5. Last Email Date (date)
6. Campaign Active (checkbox)
7. Sales Rep Display Name (text)

---

## ✅ Step 2: Create Email Templates in Zoho Campaigns

For each email, create a campaign:

### Email 1:
1. **Campaigns → Create Campaign → Regular Email**
2. Campaign Name: `BS_Email1_Welcome`
3. Topic: Marketing
4. Click "Save and Proceed"
5. **Design the email:**
   - Subject: `Thanks for connecting with Buffalo Solar ☀️`
   - Preheader: `Cut costs up to 90% and take advantage of 30%+ in incentives`
   - Body: (copy from Buffalo Solar Commercial Lead Nurture Campaign.md)
   - Use merge tags: `$[FIRSTNAME]$`, `$[COMPANY]$`
6. **Save as Draft** (don't send yet)

### Repeat for Emails 2-6
Create campaigns for all 6 emails, save as drafts.

---

## ✅ Step 3: Set Up Automation (SIMPLE METHOD)

### Option A: Use Zoho CRM Scheduled Actions (Recommended - No Flow Needed)

**For Email 1 (0-5 days):**

1. Go to **Zoho CRM → Setup → Automation → Actions → Email Notifications**
2. Click **"Create Email Notification"**
3. Configure:
   ```
   Notification Name: Send Email 1 - Welcome
   Module: Leads
   
   When to Send:
   - Workflow: Create new rule
   - Rule Name: Email 1 Trigger
   - Execute: Daily at 9:00 AM
   
   Criteria:
   (Campaign Active equals true)
   AND (Email is not empty)
   AND (Days in Stage >= 0)
   AND (Days in Stage <= 5)
   AND ((Last Campaign Email is empty) OR (Last Campaign Email is null))
   AND (Lead Status not equals "Disqualified")
   
   Email Template: Create new template with Email 1 content
   
   Send To: Lead Email
   
   From: Your verified email (campaigns@buffalosolar.com)
   ```

4. **Add instant action to update fields:**
   ```
   After sending email, also execute:
   - Update Field: Last Campaign Email = "Email 1 - Welcome"
   - Update Field: Last Email Date = Today
   ```

**For Email 2 (6-10 days):**

Repeat above, but change criteria:
```
(Days in Stage >= 6)
AND (Days in Stage <= 10)
AND (Last Campaign Email equals "Email 1 - Welcome")
```

**For Email 3 (30-35 days):**
```
(Days in Stage >= 30)
AND (Days in Stage <= 35)
AND (Last Campaign Email in ["Email 1 - Welcome", "Email 2 - Credibility"])
```

**For Email 4 (60-65 days):**
```
(Days in Stage >= 60)
AND (Days in Stage <= 65)
```

**For Email 5 (90+ days):**
```
(Days in Stage >= 90)
```

---

### Option B: Use Zoho Campaigns Automation (Even Simpler)

1. **In Zoho Campaigns → Automation → Autoresponders**

2. **Create Autoresponder Series:**
   ```
   Series Name: Commercial Lead Nurture
   
   Email 1: Send immediately when added to list
   Email 2: Send 6 days after Email 1
   Email 3: Send 24 days after Email 2
   Email 4: Send 30 days after Email 3
   Email 5: Send 30 days after Email 4
   ```

3. **Connect to CRM:**
   - Settings → Integrations → Zoho CRM
   - Auto-sync leads where Campaign Active = true
   - Add to "Commercial Lead Nurture" list

**This is the EASIEST but less flexible (doesn't pause if stage changes)**

---

### Option C: Zoho Flow with Webhook (If Above Don't Work)

**Step 1: Create Flow with Webhook Trigger**

1. Zoho Flow → Create Flow
2. Name: `Email Campaign Processor`
3. **Trigger: Webhook**
4. Copy the webhook URL you get

**Step 2: Flow Logic**

```
WEBHOOK TRIGGER
  ↓
DECISION: Check Days in Stage
  ↓
IF Days 0-5 AND Last Email is empty:
  → Zoho CRM: Update Record
     - Set: Last Campaign Email = "Email 1 - Welcome"
     - Set: Last Email Date = Today
  → Email: Send Email (using SMTP or Zoho Campaigns)
     - To: ${webhook.email}
     - Subject: Thanks for connecting with Buffalo Solar
     - Body: [Email 1 content]

ELSE IF Days 6-10 AND Last Email = "Email 1":
  → Send Email 2
  → Update CRM
  
[... continue for all emails ...]
```

**Step 3: CRM Scheduled Workflow to Trigger Flow**

```
Zoho CRM → Workflow Rules → Create Rule

Name: Daily Email Campaign Trigger
Module: Leads
When: Scheduled (Daily 9 AM)

Criteria:
  (Campaign Active = true)
  AND (Email is not empty)

Actions: Custom Function or Webhook
  URL: [Paste Flow webhook URL]
  Method: POST
  Parameters:
    lead_id: ${Leads.Id}
    email: ${Leads.Email}
    days_in_stage: ${Leads.Days_in_Stage}
    last_email: ${Leads.Last_Campaign_Email}
    first_name: ${Leads.First_Name}
    company: ${Leads.Company}
```

---

## ✅ Step 4: Test with One Lead

1. Create test lead:
   - Email: your.email@domain.com
   - Campaign Active: True
   - Days in Stage: 2
   - Last Campaign Email: (empty)

2. Run automation manually or wait for scheduled time

3. Check your email → Should receive Email 1

4. Check CRM → Fields should update

---

## ✅ Step 5: Go Live

**Gradual Rollout:**

1. **Week 1:** Enable for 10 leads
   - Filter CRM for 10 good leads
   - Set Campaign Active = True
   - Monitor closely

2. **Week 2:** Enable for 50 leads
   - Review metrics from Week 1
   - Adjust if needed
   - Enable 40 more leads

3. **Week 3:** Enable for all leads
   - Set Campaign Active = True for all qualifying leads
   - Monitor daily

---

## 📊 Monitor These Metrics

**Daily (First Week):**
- Emails sent: Check CRM "Last Email Date" updates
- Errors: Check workflow execution logs
- Bounces: Check in Zoho Campaigns

**Weekly:**
- Open rate (target: >20%)
- Click rate (target: >3%)
- Unsubscribe rate (target: <1%)

**Monthly:**
- Lead progression rate
- Conversion improvement
- Time saved by sales team

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| No emails sending | Check: Workflow is active, Criteria is correct, Email verified |
| Emails going to spam | Set up SPF/DKIM for your domain |
| Wrong email sent | Check Days in Stage calculation, Check criteria logic |
| Duplicate emails | Add check: Last Email Date not in last 7 days |
| CRM not updating | Check instant actions are configured in workflow |

---

## 💰 Quick Cost Check

- Zoho CRM: Already have ✅
- Zoho Campaigns: $30/month (5,000 contacts)
- Zoho Flow: $10/month (if using Option C)

**Total: $30-40/month**

---

## 🎯 Which Option Should You Use?

**Use Option A (CRM Scheduled Actions)** if:
- ✅ You want everything in one place (CRM)
- ✅ You don't want to pay for Zoho Flow
- ✅ Simpler to manage

**Use Option B (Campaigns Autoresponders)** if:
- ✅ You want the simplest setup
- ✅ Fixed timing is OK (can't pause if stage changes)
- ✅ Better email analytics

**Use Option C (Zoho Flow)** if:
- ✅ You need maximum flexibility
- ✅ You want to add SMS, other channels later
- ✅ You're comfortable with webhooks

---

## ✅ Production Checklist

- [ ] 7 CRM fields created and tested
- [ ] Email templates created in Campaigns (or CRM)
- [ ] Automation set up (Option A, B, or C)
- [ ] Tested with 1 dummy lead successfully
- [ ] Domain email authenticated (SPF/DKIM)
- [ ] Unsubscribe link present in all emails
- [ ] Team trained on how system works
- [ ] Monitoring dashboard set up
- [ ] Week 1: 10 leads enabled
- [ ] Week 2: 50 leads enabled  
- [ ] Week 3: All leads enabled

---

**Pick ONE option above, complete the steps, and you're live.**

**Recommended: Start with Option A (CRM Scheduled Actions) - it's built-in and requires no extra tools.**

