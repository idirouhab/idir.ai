# Mailgun Template with next-intl Integration

## Overview

The feedback email system now uses:
- **ONE Mailgun template** for all languages
- **next-intl** for translations (your existing i18n system)
- All email text managed in `messages/en.json` and `messages/es.json`

## ✅ Benefits

1. **Centralized translations** - Same system for website and emails
2. **Easy to maintain** - All translations in one place
3. **Type-safe** - TypeScript checks translation keys
4. **Scalable** - Add new languages by adding JSON files
5. **Version controlled** - Everything in Git

## 📁 File Structure

```
messages/
  en.json               # English translations (including feedbackEmail section)
  es.json               # Spanish translations (including feedbackEmail section)

app/api/newsletter/feedback/send/
  route.ts              # Current (inline HTML)
  route-with-templates.ts  # New version using Mailgun template + next-intl

docs/
  MAILGUN_FEEDBACK_TEMPLATE_SIMPLE.md  # Template HTML
  MAILGUN_WITH_NEXTINTL.md             # This file
```

## 🎯 Translation Keys

All feedback email translations are under the `feedbackEmail` namespace in `messages/en.json` and `messages/es.json`:

```json
{
  "feedbackEmail": {
    "subject": "...",
    "title": "...",
    "systemStatusLabel": "...",
    "systemStatusOnline": "...",
    "terminalLine1": "...",
    "terminalLine2": "...",
    "introText": "...",
    "calibrationModuleLabel": "...",
    "question": "...",
    "strongSignalLabel": "...",
    "strongSignalSubtext": "...",
    "mediumSignalLabel": "...",
    "mediumSignalSubtext": "...",
    "weakSignalLabel": "...",
    "weakSignalSubtext": "...",
    "footerMessage": "...",
    "footerSubtext": "...",
    "footerText": "...",
    "websiteText": "...",
    "unsubscribeText": "..."
  }
}
```

## 🚀 How to Switch

### Step 1: Create Mailgun Template

1. Login to Mailgun Dashboard
2. Go to **Sending** > **Templates**
3. Click **Create Template**
4. Name: `feedback-survey`
5. Copy HTML from `docs/MAILGUN_FEEDBACK_TEMPLATE_SIMPLE.md`
6. Save template

### Step 2: Add Environment Variable

Add to your `.env.local`:

```bash
MAILGUN_FEEDBACK_TEMPLATE=feedback-survey
```

### Step 3: Switch API Route

```bash
# Backup current version
mv app/api/newsletter/feedback/send/route.ts app/api/newsletter/feedback/send/route-inline.ts.backup

# Activate template version with next-intl
mv app/api/newsletter/feedback/send/route-with-templates.ts app/api/newsletter/feedback/send/route.ts
```

### Step 4: Test

Send a test email from `/admin/feedback` in both English and Spanish!

## 📝 Updating Translations

### To update email text:

1. Edit `messages/en.json` and `messages/es.json`
2. Find the `feedbackEmail` section
3. Update the desired key
4. Deploy

Example:

```json
{
  "feedbackEmail": {
    "subject": "New subject line here",  // ← Update this
    // ...
  }
}
```

### To add a new language:

1. Create `messages/pt.json` (for Portuguese, for example)
2. Copy structure from `messages/en.json`
3. Translate all `feedbackEmail` keys
4. Update `i18n/routing.ts` to include new locale
5. Deploy

## 🔧 How It Works

```typescript
// In the API route
const t = await getTranslations({
  locale: lang,              // 'en' or 'es'
  namespace: 'feedbackEmail' // Section in JSON file
});

// Get translated text
const subject = t('subject');       // "Calibrate your content signal"
const title = t('title');           // "AI NEWS <span>DAILY</span>"
const question = t('question');     // "What signal strength..."

// Pass to Mailgun template
const templateVariables = {
  token, subscriber_email, unsubscribe_url,
  title: t('title'),
  question: t('question'),
  // ... all other translations
};
```

## 🎨 Template Design Updates

When you want to update the HTML/CSS design:

1. Update template in Mailgun dashboard
2. Save updated HTML to `docs/MAILGUN_FEEDBACK_TEMPLATE_SIMPLE.md`
3. Commit to Git
4. **No code deployment needed!**

## 📊 Comparison

| Aspect | Old (Inline) | New (Mailgun + next-intl) |
|--------|-------------|--------------------------|
| **Code size** | ~765 lines | ~250 lines |
| **Translation system** | Inline strings | next-intl (unified) |
| **Update translations** | Redeploy | Edit JSON, redeploy |
| **Update design** | Redeploy | Update in Mailgun |
| **Add language** | Copy all code | Add JSON file |
| **Type safety** | ❌ | ✅ |
| **Consistency** | Separate from site | Same as site |

## 🔄 Rollback

If you need to rollback:

```bash
# Restore original version
mv app/api/newsletter/feedback/send/route.ts app/api/newsletter/feedback/send/route-with-templates.ts
mv app/api/newsletter/feedback/send/route-inline.ts.backup app/api/newsletter/feedback/send/route.ts
```

## 🆘 Troubleshooting

### Translation not found error

```
Error: Missing translation for key...
```

**Solution:** Ensure the key exists in both `messages/en.json` and `messages/es.json` under `feedbackEmail`.

### Wrong language sent

**Solution:** Verify subscriber has correct `lang` field in database (`'en'` or `'es'`).

### Template variables not rendering

**Solution:** Check that all translation keys are fetched and passed to `templateVariables` object.

## 🎯 Best Practices

### ✅ DO:
- Keep all email translations in `messages/*.json`
- Update both English and Spanish together
- Use descriptive translation keys
- Test with both languages before deploying
- Keep template HTML in Git

### ❌ DON'T:
- Hard-code text in API route
- Use multiple templates for different languages
- Mix translation systems
- Forget to update Spanish when updating English

## 📚 Adding New Email Templates

To add another email template (e.g., welcome email):

1. **Add translations to JSON files:**
```json
{
  "welcomeEmail": {
    "subject": "Welcome to AI News Daily!",
    "greeting": "Hey {name}!",
    "body": "Thanks for subscribing..."
  }
}
```

2. **Create Mailgun template** with `{{greeting}}`, `{{body}}` variables

3. **Use in API route:**
```typescript
const t = await getTranslations({
  locale: lang,
  namespace: 'welcomeEmail'
});

const templateVariables = {
  greeting: t('greeting', { name: subscriber.name }),
  body: t('body'),
};
```

## 🌍 Supported Languages

Currently configured:
- 🇺🇸 English (`en`)
- 🇪🇸 Spanish (`es`)

To add more, create `messages/[locale].json` and update `i18n/routing.ts`.

## 📖 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Mailgun Templates Guide](https://documentation.mailgun.com/en/latest/user_manual.html#templates)
- Your template HTML: `docs/MAILGUN_FEEDBACK_TEMPLATE_SIMPLE.md`

---

**Result:** Clean, maintainable, internationalized email system using your existing i18n infrastructure! 🎉
