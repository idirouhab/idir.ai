# Manual Certificates Quick Reference

## 🚀 Quick Commands

### Single Certificate
```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "John Doe" \
  --email "john@example.com" \
  --course-title "Automation 101" \
  --completed-at "2026-01-20"
```

### Bulk Import
```bash
npx tsx scripts/bulk-import-certificates.ts certificates.csv
```

### Dry Run (Test First)
```bash
npx tsx scripts/bulk-import-certificates.ts certificates.csv --dry-run
```

---

## 📋 CSV Format

```csv
student_name,student_email,course_title,completed_at,course_id
John Doe,john@example.com,Automation 101,2026-01-20,
Jane Smith,jane@example.com,Automation 101,2026-01-19,
```

**Required**: `student_name`, `student_email`, `course_title`, `completed_at`
**Optional**: `course_id`

---

## 📧 Email Template

```
Subject: Your Course Certificate

Congratulations! Your certificate for [Course Name] is ready.

Certificate ID: CERT-2026-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

Verify at: https://idir.ai/en/certificates/verify

This certificate is cryptographically secured and can be publicly verified.
```

---

## 🔍 Verification

1. Go to: https://idir.ai/en/certificates/verify
2. Enter certificate ID
3. View status and details

---

## 🗄️ Database Query

```sql
-- View all manual certificates
SELECT
  certificate_id,
  snapshot_payload->>'student_full_name' as student,
  snapshot_payload->>'course_title' as course,
  issued_at
FROM certificates
WHERE course_signup_id IS NULL
ORDER BY issued_at DESC;
```

---

## ⚠️ Important Notes

- Manual certificates are **identical** to regular certificates
- They have the **same verification** process
- They are **cryptographically secured** with SHA-256
- They **cannot be forged** or tampered with
- `course_signup_id` is `NULL` for manual certificates

---

## 🔧 Common Issues

| Issue | Fix |
|-------|-----|
| Invalid email | Must contain `@` |
| Invalid date | Use `YYYY-MM-DD` format |
| Missing columns | Check CSV headers match required format |
| Database error | Run migration 075 first |

---

## 📖 Full Documentation

See `MANUAL_CERTIFICATES.md` for:
- Complete usage guide
- Use cases and examples
- Programmatic API
- Troubleshooting
- FAQ

---

## ✅ Checklist

Before issuing certificates:

- [ ] Run migration 075: `npm run migrate:local`
- [ ] Test with single certificate first
- [ ] Use `--dry-run` for bulk imports
- [ ] Verify CSV format matches sample
- [ ] Include `--actor` for audit trail
- [ ] Send verification URL to students

---

**Need Help?** See `MANUAL_CERTIFICATES.md`
