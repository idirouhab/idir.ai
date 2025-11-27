# Migrating to Mailgun Templates

You have two versions of the feedback email sending route:

1. **`route.ts`** (current) - Inline HTML template in code
2. **`route-with-templates.ts`** (new) - Uses Mailgun external templates

## Why Use External Templates?

**Benefits:**
- ✅ Update email design without deploying code
- ✅ A/B test different designs in Mailgun dashboard
- ✅ Cleaner, more maintainable code
- ✅ Easier for non-developers to edit
- ✅ Leverage Mailgun's template editor

**Drawbacks:**
- ❌ Requires manual setup in Mailgun dashboard
- ❌ Templates stored outside version control
- ❌ Need to manage templates across environments (dev/prod)

## Migration Steps

### 1. Create Templates in Mailgun

Follow the instructions in `MAILGUN_FEEDBACK_TEMPLATE.md` to create two templates:
- `feedback-survey-en` (English version)
- `feedback-survey-es` (Spanish version)

### 2. Add Environment Variables

Add to your `.env.local`:

```bash
MAILGUN_FEEDBACK_TEMPLATE_EN=feedback-survey-en
MAILGUN_FEEDBACK_TEMPLATE_ES=feedback-survey-es
```

### 3. Test the New Route

Before switching, test the template version by temporarily renaming files:

```bash
# Backup current version
mv app/api/newsletter/feedback/send/route.ts app/api/newsletter/feedback/send/route-inline.ts.bak

# Activate template version
mv app/api/newsletter/feedback/send/route-with-templates.ts app/api/newsletter/feedback/send/route.ts
```

Send a test email from the admin panel to verify it works.

### 4. Rollback if Needed

If something doesn't work:

```bash
# Restore original
mv app/api/newsletter/feedback/send/route.ts app/api/newsletter/feedback/send/route-with-templates.ts
mv app/api/newsletter/feedback/send/route-inline.ts.bak app/api/newsletter/feedback/send/route.ts
```

## Template Variables

The templates receive these variables:

```javascript
{
  lang: "en" | "es",           // Subscriber's language
  token: "abc123...",           // Feedback tracking token
  subscriber_email: "user@...", // Subscriber's email
  unsubscribe_url: "https://..." // Unsubscribe link
}
```

## Mailgun Template Syntax

Templates use Handlebars syntax:

```handlebars
<!-- Simple variable -->
{{token}}

<!-- Conditional (requires helper or use two templates) -->
{{#if_eq lang 'es'}}
  Spanish text
{{else}}
  English text
{{/if_eq}}

<!-- URL in link -->
<a href="https://idir.ai/api/newsletter/feedback?token={{token}}&type=very_useful">
  Click here
</a>
```

**Note:** The `if_eq` helper may not be available in Mailgun by default. This is why we recommend **two separate templates** (one per language) instead of conditionals.

## Testing Templates

### Test via API:

```bash
curl -X POST http://localhost:3001/api/newsletter/feedback/send \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session=YOUR_SESSION_TOKEN" \
  -d '{
    "testEmail": "your-test@email.com"
  }'
```

### Test in Mailgun Dashboard:

1. Go to **Sending** > **Templates**
2. Click on your template
3. Click **Send Test**
4. Enter test variables:
   ```json
   {
     "lang": "en",
     "token": "test-token-123",
     "subscriber_email": "test@example.com",
     "unsubscribe_url": "https://idir.ai/en/unsubscribe?email=test@example.com"
   }
   ```

## Managing Templates Across Environments

### Development vs Production

You likely want different templates for dev/prod:

```bash
# .env.development.local
MAILGUN_FEEDBACK_TEMPLATE_EN=feedback-survey-en-dev
MAILGUN_FEEDBACK_TEMPLATE_ES=feedback-survey-es-dev

# .env.production
MAILGUN_FEEDBACK_TEMPLATE_EN=feedback-survey-en
MAILGUN_FEEDBACK_TEMPLATE_ES=feedback-survey-es
```

### Version Control for Templates

Since templates live in Mailgun, consider:

1. **Keep HTML in Git:** Store template HTML in `docs/` folder (like we did)
2. **Document Changes:** Add comments in `MAILGUN_FEEDBACK_TEMPLATE.md` when updating
3. **Backup Templates:** Export templates from Mailgun periodically

### Updating Templates

When you update a template in Mailgun:

1. Update the HTML in `docs/MAILGUN_FEEDBACK_TEMPLATE.md`
2. Update the template in Mailgun dashboard
3. Test with a test email
4. Commit the HTML changes to Git
5. No code deployment needed! ✅

## Troubleshooting

### Template not found error

```
Error: Template not found
```

**Solution:** Verify template exists in Mailgun dashboard and name matches exactly.

### Variables not rendering

```
Email shows: {{token}} instead of actual token
```

**Solution:** Make sure you're using `h:X-Mailgun-Variables` header (not `v:` or `t:`):

```javascript
'h:X-Mailgun-Variables': JSON.stringify(templateVariables)
```

### Different HTML in email vs preview

**Solution:** Some email clients strip certain CSS. Test in multiple clients:
- Gmail (web)
- Outlook (desktop)
- Apple Mail (iOS)
- Thunderbird

Use Mailgun's preview feature to test across clients.

## Performance

External templates are slightly faster because:
- No HTML string building in Node.js
- Mailgun caches compiled templates
- Smaller API request payload

## Best Practices

1. **Use descriptive template names:** `feedback-survey-v2-en` instead of `template1-en`
2. **Version your templates:** Keep old versions as backups (`feedback-survey-v1-en`)
3. **Test thoroughly:** Always send test emails before bulk campaigns
4. **Monitor delivery:** Check Mailgun logs for template rendering errors
5. **Keep HTML in Git:** Maintain source of truth in version control

## Recommendation

**Use external templates if:**
- ✅ You frequently update email designs
- ✅ Non-developers need to edit emails
- ✅ You want to A/B test designs
- ✅ You have multiple email templates

**Keep inline HTML if:**
- ✅ Email design rarely changes
- ✅ Only developers edit emails
- ✅ You want everything in version control
- ✅ You have just one or two email templates
