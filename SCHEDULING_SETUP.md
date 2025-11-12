# Blog Post Scheduling Implementation

## ✅ Completed Steps

1. **Database Migration Created**: `migrations/010_add_scheduled_publish_to_blog_posts.sql`
2. **TypeScript Types Updated**: Added `scheduled_publish_at` to `BlogPost` and `BlogPostInput` types in `lib/blog.ts`
3. **API Endpoint Created**: `/api/blog/publish-scheduled` (POST and GET methods)
4. **Form State Updated**: Added `scheduled_publish_at` to BlogPostForm state

## 🚧 Remaining Steps

### 1. Run Database Migration

```bash
npm run migrate
```

Or manually in Supabase SQL Editor:
```sql
ALTER TABLE blog_posts
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE NULL;

CREATE INDEX idx_blog_posts_scheduled_publish
ON blog_posts(scheduled_publish_at)
WHERE scheduled_publish_at IS NOT NULL AND status = 'draft';

COMMENT ON COLUMN blog_posts.scheduled_publish_at IS 'When set with status=draft, post will be auto-published at this time. NULL means no scheduling.';
```

### 2. Add SCHEDULER_POST_API_KEY to Environment Variables

Add to `.env.local`:
```env
SCHEDULER_POST_API_KEY=your_secure_random_key_here
```

Generate a secure key:
```bash
openssl rand -base64 32
```

### 3. Update BlogPostForm - Add UI Field

Add this after the Status field (around line 760 in Blog PostForm.tsx):

```tsx
{/* Scheduled Publish Date/Time */}
{formData.status === 'draft' && (
  <div>
    <label className="block text-white font-bold mb-2 uppercase text-sm">
      Schedule Publication (Optional)
    </label>
    <input
      type="datetime-local"
      value={formData.scheduled_publish_at}
      onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
      className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
      min={new Date().toISOString().slice(0, 16)}
    />
    {formData.scheduled_publish_at && (
      <p className="text-xs text-[#00ff88] mt-1">
        📅 Will be published at: {new Date(formData.scheduled_publish_at).toLocaleString()}
      </p>
    )}
    <p className="text-xs text-gray-500 mt-1">
      Leave empty to keep as draft. Post will auto-publish at the scheduled time.
    </p>
  </div>
)}
```

### 4. Update BlogPostForm - Add to Submit Handler

In the `handleSubmit` function, add `scheduled_publish_at` to both UPDATE and CREATE payloads:

**For UPDATE (around line 141):**
```tsx
const updatePayload: any = {
  title: isEnglish ? formData.title_en : formData.title_es,
  content: isEnglish ? formData.content_en : formData.content_es,
  excerpt: isEnglish ? formData.excerpt_en : formData.excerpt_es,
  cover_image: formData.cover_image,
  category: formData.category,
  status: formData.status,
  scheduled_publish_at: formData.scheduled_publish_at || null,
};
```

**For CREATE (around line 195):**
```tsx
const payload = {
  title_en: formData.title_en,
  content_en: formData.content_en,
  content_es: formData.content_es,
  cover_image: formData.cover_image,
  category: formData.category,
  status: formData.status,
  scheduled_publish_at: formData.scheduled_publish_at || null,
  en: { ...},
  es: { ...},
};
```

### 5. Update Admin Blog List Page

Add scheduled indicator badge in `/app/admin/blog/page.tsx` (around line 150):

```tsx
{/* Scheduled indicator */}
{post.scheduled_publish_at && post.status === 'draft' && (
  <span className="px-2 py-1 bg-[#00cfff20] border border-[#00cfff] text-[#00cfff] text-xs font-bold uppercase">
    📅 Scheduled: {new Date(post.scheduled_publish_at).toLocaleDateString()}
  </span>
)}
```

### 6. Setup n8n Cron Workflow

Create a new workflow in n8n with the following nodes:

**Node 1: Schedule Trigger**
- Type: `Schedule Trigger`
- Interval: Every 10 minutes
- Cron Expression: `*/10 * * * *`

**Node 2: HTTP Request**
- Method: POST
- URL: `https://your-domain.com/api/blog/publish-scheduled`
- Authentication: Header Auth
  - Name: `Authorization`
  - Value: `Bearer ${SCHEDULER_POST_API_KEY}`
- Options:
  - Timeout: 30000 (30 seconds)

**Node 3: IF (Optional - for notifications)**
- Condition: `{{ $json.published_count }} > 0`

**Node 4a: Send Notification (if published)**
- Send email/Slack message with published posts

**Node 4b: Do Nothing (if no posts)**

### 7. Test the Setup

**Test 1: Check Status Endpoint**
```bash
curl -H "Authorization: Bearer SCHEDULER_POST_API_KEY" \
  https://your-domain.com/api/blog/publish-scheduled
```

**Test 2: Create Scheduled Post**
1. Go to `/admin/blog/new`
2. Create a post with status="draft"
3. Set scheduled_publish_at to 2 minutes from now
4. Save the post
5. Wait for the n8n cron to run
6. Verify post is published

**Test 3: Manual Trigger**
```bash
curl -X POST \
  -H "Authorization: Bearer SCHEDULER_POST_API_KEY" \
  https://your-domain.com/api/blog/publish-scheduled
```

## How It Works

### User Flow
1. User creates a blog post with `status='draft'`
2. User sets `scheduled_publish_at` to a future date/time
3. Post is saved to database with these values
4. Post appears in admin list with "Scheduled" badge

### n8n Cron Flow
1. Every 10 minutes, n8n calls `/api/blog/publish-scheduled`
2. Endpoint finds all posts where:
   - `status = 'draft'`
   - `scheduled_publish_at IS NOT NULL`
   - `scheduled_publish_at <= NOW()`
3. For each matching post:
   - Set `status = 'published'`
   - Set `published_at = NOW()`
   - Clear `scheduled_publish_at = NULL`
4. Return count of published posts

### Security
- API endpoint is protected by `SCHEDULER_POST_API_KEY`
- Only n8n workflow can trigger publishing
- Invalid API key returns 401 Unauthorized

## Edge Cases Handled

- ✅ User can cancel scheduling by clearing the date or changing to published
- ✅ User can reschedule by updating `scheduled_publish_at`
- ✅ Multiple posts can be scheduled for same time
- ✅ Bilingual posts are handled separately
- ✅ Failed publishes are logged and reported
- ✅ Endpoint is idempotent (safe to call multiple times)

## Future Enhancements

- [ ] Add timezone selector (currently uses UTC)
- [ ] Email notification when post is published
- [ ] Slack notification to team channel
- [ ] Preview of scheduled posts on public calendar
- [ ] Bulk scheduling interface
- [ ] Recurring posts (weekly/monthly)

## Troubleshooting

**Posts not publishing:**
1. Check n8n workflow is active
2. Verify `SCHEDULER_POST_API_KEY` matches in both places
3. Check n8n execution logs
4. Call GET endpoint to see pending posts
5. Verify database migration ran successfully

**Timezone issues:**
- All times are stored as UTC in database
- Display times are converted to user's local timezone in UI
- Make sure datetime-local input accounts for user's timezone

## Monitoring

Check scheduled posts:
```bash
curl -H "Authorization: Bearer SCHEDULER_POST_API_KEY" \
  https://your-domain.com/api/blog/publish-scheduled | jq
```

Response shows:
- `ready_to_publish`: Posts that should publish now
- `future_scheduled`: Posts scheduled for later
- Full list of each post with title, slug, language

---

**Implementation Complete!** 🎉

Run the remaining steps above to activate the scheduling feature.
