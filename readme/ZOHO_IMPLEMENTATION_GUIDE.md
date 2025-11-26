# Buffalo Solar - Lead Nurture Implementation Guide
**Simple, Step-by-Step Instructions**

---

## ✅ What You Already Have (Keep These)
- Lead Status (Made Contact, Not Contacted, Attempted to Contact)
- Company
- Lead Name
- Lead Owner
- Lead Source
- Last Activity Time
- Created Time
- Organization Type
- Email
- Phone
- Description
- Utility Company

**We'll work WITH these fields, not replace them.**

---

## 🎯 What We're Adding

### New Fields (7 fields)
1. `Lead Stage` - Which nurture phase they're in
2. `Stage Entry Date` - When they entered current stage
3. `Days in Stage` - Auto-calculated
4. `Last Campaign Email` - Which email was sent
5. `Last Email Date` - When it was sent
6. `Campaign Active` - On/off switch for automation
7. `Sales Rep Display Name` - For email personalization

### New Automation (3 workflows in Zoho Flow)
1. Daily email sender
2. Stage change detector
3. Website lead connector

---

## 📋 WEEK 1: Set Up CRM Fields (2 hours)

### Step 1: Add Lead Stage Field
Go to: **Zoho CRM → Setup → Customization → Modules → Leads → Fields**

**Create New Field:**
```
Field Label: Lead Stage
Type: Pick List
Options (add these):
  - New Lead (0-5 days)
  - Initial Contact (6-30 days)
  - Qualified (30-60 days)
  - Long-term Nurture (60-90 days)
  - Dormant (90+ days)
Default: New Lead (0-5 days)
Required: No
```

### Step 2: Add Stage Entry Date
```
Field Label: Stage Entry Date
Type: Date/Time
Default Value: Current Date Time (or leave blank)
Required: No
```

**Important:** Workflow 2 in Week 2 will automatically set this when leads are created, ensuring Days in Stage always calculates correctly.

### Step 3: Add Days in Stage (Auto-calculated)
```
Field Label: Days in Stage
Type: Formula (Number)
Formula: DATEDIFF(TODAY(), Stage_Entry_Date, "day")
```

### Step 4: Add Last Campaign Email
```
Field Label: Last Campaign Email
Type: Pick List
Options:
  - Email 1 - Welcome
  - Email 2 - Credibility
  - Email 3 - Incentive
  - Email 4 - Education
  - Email 5 - Reengagement
  - Website Update
```

### Step 5: Add Last Email Date
```
Field Label: Last Email Date
Type: Date
```

### Step 6: Add Campaign Active
```
Field Label: Campaign Active
Type: Checkbox
Default: Checked (True)
```

### Step 7: Add Sales Rep Display Name
```
Field Label: Sales Rep Display Name
Type: Single Line
Default: Leave blank (will use Lead Owner name)
Length: 100
```

**✅ DONE with CRM fields**

---

## 📋 WEEK 2: Create Workflow Rules (1 hour)

### Workflow 1: Update Stage Entry Date When Stage Changes

Go to: **Setup → Automation → Workflow Rules → Create Rule**

```
Rule Name: Update Stage Entry on Change
Module: Leads
When: Edit (any time field is edited)
Condition: (Lead Stage is not empty) AND (Lead Stage is modified)
Action: Field Update
  - Field: Stage Entry Date
  - Value: Current Date Time
```

### Workflow 2: Set Stage and Entry Date for New Leads

```
Rule Name: Set New Lead Stage and Date
Module: Leads
When: Create (new lead created)
Condition: (Lead Stage is empty) OR (Stage Entry Date is empty)
Actions: 
  1. Field Update:
     - Field: Lead Stage
     - Value: New Lead (0-5 days)
  
  2. Field Update:
     - Field: Stage Entry Date
     - Value: Current Date Time
```

### Workflow 3: Turn Off Campaign When Converted

```
Rule Name: Deactivate Campaign on Win
Module: Leads
When: Edit
Condition: (Lead Status equals "Made Contact") AND (Description contains "won" OR Description contains "closed")
Action: Field Update
  - Field: Campaign Active
  - Value: Unchecked (False)
```

**✅ DONE with workflows**

---

### Fix for Existing Leads

**After creating Workflow 2, you need to backfill existing leads:**

Go to: **Zoho CRM → Leads → All Leads**

1. Select all leads (or filter for leads where Stage Entry Date is empty)
2. Click **Mass Update**
3. Update field: **Stage Entry Date** = Current Date Time
4. Click Update

This ensures all existing leads have a Stage Entry Date so "Days in Stage" calculates correctly.

---

## 📋 WEEK 3: Create Email Templates (2 hours)

Go to: **Zoho Campaigns → Email Templates → Create New**

### Template 1: Welcome (Copy from your doc)
```
Name: BS_Email1_Welcome
Subject: Thanks for connecting with Buffalo Solar ☀️
Use merge fields:
  - ${First Name}
  - ${Company}
  - ${Lead Owner}
```

### Template 2-6: Create the other 5 templates
Use the content from "Buffalo Solar Commercial Lead Nurture Campaign.md"

**✅ DONE with templates**

---

## 📋 WEEK 4: Build Email Automation with CRM Workflows (2 hours)

**No Zoho Flow needed! Use built-in CRM Workflow Rules.**

Go to: **Zoho CRM → Setup → Automation → Workflow Rules**

---

### Workflow 1: Send Email 1 - Welcome (0-5 days)

**Create Rule:**
```
Rule Name: Email 1 - Welcome (0-5 days)
Module: Leads
Description: Send welcome email to leads 0-5 days in stage
Execute: On a schedule (Every day at 9:00 AM EST)
```

**Criteria:**
```
(Campaign Active equals true)
AND (Email is not empty)
AND (Days in Stage >= 0)
AND (Days in Stage <= 5)
AND ((Last Campaign Email is empty) OR (Last Campaign Email is null))
AND (Lead Status not in [Disqualified, Converted])
```

**Instant Actions:**

1. **Send Email:**
   - Action: Email Notification
   - To: Lead Email
   - Template: BS_Email1_Welcome (create email template in CRM)
   - From: your-email@buffalosolar.com

2. **Update Fields:**
   - Action: Field Update
   - Last Campaign Email = "Email 1 - Welcome"
   - Last Email Date = Today

**Save and Activate**

---

### Workflow 2: Send Email 2 - Credibility (6-10 days)

**Create Rule:**
```
Rule Name: Email 2 - Credibility (6-10 days)
Execute: On a schedule (Every day at 9:00 AM EST)
```

**Criteria:**
```
(Campaign Active equals true)
AND (Email is not empty)
AND (Days in Stage >= 6)
AND (Days in Stage <= 10)
AND (Last Campaign Email equals "Email 1 - Welcome")
AND (Lead Status not in [Disqualified, Converted])
```

**Instant Actions:**
1. Send Email: Template = BS_Email2_Credibility
2. Update: Last Campaign Email = "Email 2 - Credibility"
3. Update: Last Email Date = Today

**Save and Activate**

---

### Workflow 3: Send Email 3 - Incentive (30-35 days)

**Create Rule:**
```
Rule Name: Email 3 - Incentive (30-35 days)
Execute: On a schedule (Every day at 9:00 AM EST)
```

**Criteria:**
```
(Campaign Active equals true)
AND (Email is not empty)
AND (Days in Stage >= 30)
AND (Days in Stage <= 35)
AND (Last Campaign Email in ["Email 1 - Welcome", "Email 2 - Credibility"])
AND (Lead Status not in [Disqualified, Converted])
```

**Instant Actions:**
1. Send Email: Template = BS_Email3_Incentive
2. Update: Last Campaign Email = "Email 3 - Incentive"
3. Update: Last Email Date = Today

**Save and Activate**

---

### Workflow 4: Send Email 4 - Education (60-65 days)

**Create Rule:**
```
Rule Name: Email 4 - Education (60-65 days)
Execute: On a schedule (Every day at 9:00 AM EST)
```

**Criteria:**
```
(Campaign Active equals true)
AND (Email is not empty)
AND (Days in Stage >= 60)
AND (Days in Stage <= 65)
AND (Lead Status not in [Disqualified, Converted])
```

**Instant Actions:**
1. Send Email: Template = BS_Email4_Education
2. Update: Last Campaign Email = "Email 4 - Education"
3. Update: Last Email Date = Today

**Save and Activate**

---

### Workflow 5: Send Email 5 - Reengagement (90+ days)

**Create Rule:**
```
Rule Name: Email 5 - Reengagement (90+ days)
Execute: On a schedule (Every day at 9:00 AM EST)
```

**Criteria:**
```
(Campaign Active equals true)
AND (Email is not empty)
AND (Days in Stage >= 90)
AND (Lead Status not in [Disqualified, Converted])
```

**Instant Actions:**
1. Send Email: Template = BS_Email5_Reengagement
2. Update: Last Campaign Email = "Email 5 - Reengagement"
3. Update: Last Email Date = Today
4. Update: Lead Stage = "Dormant (90+ days)"

**Save and Activate**

---

### Create Email Templates in CRM

For each workflow, you need an email template:

Go to: **Setup → Templates → Email Templates → Create Template**

**Template 1: BS_Email1_Welcome**
- Name: BS_Email1_Welcome
- Subject: Thanks for connecting with Buffalo Solar ☀️
- Body: (Copy from Buffalo Solar Commercial Lead Nurture Campaign.md)
- Use merge fields: `{!Leads.First Name}`, `{!Leads.Company}`, `{!Leads.Lead Owner}`

Repeat for all 5 email templates.

**✅ DONE with automation - No Zoho Flow needed!**

---

## 📋 WEEK 5: Connect Website Forms (2 hours)

### Option A: Simple - Use Zoho Forms

1. Go to **Zoho Forms → Create Form**
2. Add fields: First Name, Last Name, Company, Email, Phone, Message
3. Go to **Settings → Integrations → Zoho CRM**
4. Map fields:
   ```
   Form Field → CRM Field
   First Name → First Name
   Last Name → Last Name
   Company → Company
   Email → Email
   Phone → Phone
   Message → Description
   
   Set defaults:
   Lead Source = "Website"
   Lead Stage = "New Lead (0-5 days)"
   Campaign Active = True
   ```
5. Get embed code
6. Replace your website form with Zoho Form embed

### Option B: API Integration (if you have a developer)

**Webhook endpoint:**
```
POST https://www.zohoapis.com/crm/v3/Leads

Headers:
  Authorization: Zoho-oauthtoken {YOUR_TOKEN}

Body:
{
  "data": [{
    "First_Name": "{firstName}",
    "Last_Name": "{lastName}",
    "Company": "{company}",
    "Email": "{email}",
    "Phone": "{phone}",
    "Lead_Source": "Website",
    "Lead_Stage": "New Lead (0-5 days)",
    "Stage_Entry_Date": "{currentDateTime}",
    "Campaign_Active": true
  }]
}
```

**✅ DONE with website integration**

---

## 📋 WEEK 6: Test & Launch (2 hours)

### Test 1: Create Test Lead
1. Create a new lead in CRM with YOUR email
2. Set: Campaign Active = True, Days in Stage = 2
3. Save

### Test 2: Run Flow Manually
1. Go to Zoho Flow → Your flow → Test Flow
2. Wait 1-2 minutes
3. Check your email - you should receive Email 1

### Test 3: Check CRM Updated
1. Refresh the test lead in CRM
2. Verify:
   - Last Campaign Email = "Email 1 - Welcome"
   - Last Email Date = Today

### If All Tests Pass:
1. **Activate the flow** in Zoho Flow
2. Start with 50 leads:
   - Filter CRM for 50 good leads with valid emails
   - Set Campaign Active = True for these 50
   - Monitor for 1 week
3. If working well, enable for all leads

**✅ DONE - System is live!**

---

## 🔧 How to Use Daily

### Sales Team:
- **Keep using Lead Status as normal** (Made Contact, Not Contacted, etc.)
- When you move a deal forward, update **Lead Stage** to next phase
- Check "Last Campaign Email" before calling to see what they received
- To stop emails for a lead: Uncheck "Campaign Active"

### Marketing Team:
- Check Zoho Campaigns weekly for email stats (open rates, clicks)
- Update email templates seasonally (new incentives, projects)

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| Lead not getting emails | Check: Email valid? Campaign Active = true? |
| Wrong email sent | Check Days in Stage field is calculating correctly |
| Flow stopped | Go to Zoho Flow → Check execution history for errors |
| Emails going to spam | Set up SPF/DKIM records for your domain |

---

## 📊 What to Monitor Weekly

1. Zoho Flow execution history (should be 100% success)
2. Email open rates in Zoho Campaigns (target: >20%)
3. Number of leads in each stage
4. Any bounced emails (update/remove those emails)

---

## 💰 Costs

- Zoho CRM: Already have ✅
- Zoho Flow: NOT needed ✅ (using CRM workflows instead)

**Total: $0/month extra** (if using CRM email templates)

*Optional: Zoho Campaigns ($30/month) for better email analytics, but not required*

---

## ❓ Questions?

**Can we modify the email schedule?**  
Yes, just change the "Days in Stage" numbers in the Zoho Flow decision branches.

**Can we add more emails?**  
Yes, create new template and add another decision branch in the flow.

**What if someone unsubscribes?**  
Zoho Campaigns handles this automatically - they won't get more emails.

**Can we segment by industry?**  
Yes, add a condition in Flow: "IF Organization Type = Healthcare" → send different email.

---

## 🎯 Summary Timeline

- **Week 1:** Add 7 fields to CRM (2 hrs)
- **Week 2:** Create 3 workflow rules (1 hr)
- **Week 3:** Create 6 email templates (2 hrs)
- **Week 4:** Create 5 scheduled workflow rules for emails (2 hrs)
- **Week 5:** Connect website forms (2 hrs)
- **Week 6:** Test and launch (2 hrs)

**Total: ~11 hours over 6 weeks**

**NO Zoho Flow needed - everything in CRM!**

---

**Start with Week 1, complete each week in order. That's it.**

