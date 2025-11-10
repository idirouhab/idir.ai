# Simple Feedback Tracking System (Option 1)

## What it does
- ✅ Tracks when you LAST sent feedback email to each user
- ✅ Allows resending after X days (e.g., every 30 days)
- ✅ Filters by subscription age (e.g., only 4+ days subscribed)

## Setup (2 steps)

### 1. Run database migration
```bash
psql $DATABASE_URL -f supabase-newsletter-feedback-migration-sent-at.sql
```

### 2. Deploy code
```bash
git add .
git commit -m "feat: track feedback email sends with resend capability"
git push
```

## How to use

### Sending feedback surveys

Go to `/admin/subscribers`:

**New filters:**
- **"Subscribed ≥ X days"** - Only users subscribed for X+ days (e.g., 4)
- **"Last sent ≥ X days ago"** - Only users who received feedback X+ days ago (or never)
  - Set to 30 = resend to users who got it 30+ days ago
  - Set to 0 = no restriction (can resend immediately)

**New columns:**
- **"Last Sent"** - Shows "5d ago", "30d ago", or "Never"
- **"Age"** - Shows days since subscription

**Stats:**
- **"📧 Feedback Sent"** - Total who ever received it
- **"⏳ Not Sent Yet"** - Total who never received it

## Example workflows

### Monthly feedback campaign

**Month 1** (send to users with 4+ days):
```
Filters: Subscribed ≥ 4 days + Last sent ≥ 0 days
Result: 100 users receive email
Table shows: "5d ago", "10d ago", etc.
```

**Month 2** (30 days later - resend to eligible):
```
Filters: Subscribed ≥ 4 days + Last sent ≥ 30 days
Result: Previous 100 users + new subscribers receive email
Table updates: All show "0d ago" (just sent)
```

### Target only new users (never sent before)

```
Filters: Subscribed ≥ 4 days + Last sent ≥ 0 days + "📧 Not Sent" status
Result: Only users who NEVER received feedback
```

## Key features
- **Resend capability**: Same user can receive feedback multiple times
- **Time-based control**: You decide minimum days between sends
- **Never lose track**: See exactly when each user last received feedback
- **Safety first**: Unsubscribed users are automatically excluded (double-checked before sending)
