# Blog API Documentation v2.0

## 📚 Interactive Documentation

Visit the interactive API documentation:
- **Production**: https://idir.ai/api/docs
- **Local**: http://localhost:3000/api/docs

## 📄 OpenAPI Specification

Download the OpenAPI spec:
- **YAML**: https://idir.ai/openapi.yaml

---

## 🎯 RESTful API Design

Clean, resource-based endpoints following REST best practices:

| Resource | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **Posts** | GET | `/api/posts` | List/filter posts |
| | GET | `/api/posts?grouped=true` | Grouped view (newsletter) |
| | GET | `/api/posts/{id}` | Get single post |
| | POST | `/api/posts` | Create post(s) |
| | PUT | `/api/posts/{id}` | Update post |
| | DELETE | `/api/posts/{id}` | Delete post |
| **Media** | POST | `/api/media` | Upload image |

---

## 🚀 Quick Start Examples

### Newsletter Integration (Most Common Use Case)

```python
import requests
from datetime import date

# Get today's posts in grouped format
today = date.today().strftime('%Y-%m-%d')
response = requests.get(f'https://idir.ai/api/posts?grouped=true&date={today}')
data = response.json()

# Send to subscribers
for user in subscribers:
    for post in data['data']:
        # Pick user's language version
        version = post.get(user.language)  # 'en' or 'es'

        if version:
            send_email(
                to=user.email,
                subject=version['title'],
                body=f"""
                <h2>{version['title']}</h2>
                <p>{version['excerpt']}</p>
                <a href="{version['url']}">Read more →</a>
                """
            )
```

### TypeScript/JavaScript

```typescript
// List published posts
const posts = await fetch('https://idir.ai/api/posts?language=en&limit=10')
  .then(r => r.json());

// Get grouped posts for newsletter
const grouped = await fetch('https://idir.ai/api/posts?grouped=true&date=2025-01-12')
  .then(r => r.json());

// Create bilingual post (requires auth)
const newPost = await fetch('https://idir.ai/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Include session cookie
  body: JSON.stringify({
    bilingual: true,
    title_en: 'My Post Title',
    content_en: '# Content here...',
    content_es: '# Contenido aquí...',
    category: 'insights',
    status: 'published',
    en: {
      excerpt: 'English excerpt',
      tags: 'AI, automation',
      meta_description: 'SEO description',
      meta_keywords: 'ai, automation'
    },
    es: {
      title: 'Título del Post',
      excerpt: 'Extracto en español',
      tags: 'IA, automatización',
      meta_description: 'Descripción SEO',
      meta_keywords: 'ia, automatización'
    }
  })
}).then(r => r.json());
```

### cURL Examples

```bash
# List posts with filters
curl "https://idir.ai/api/posts?category=insights&language=en&limit=5"

# Get grouped posts (newsletter format)
curl "https://idir.ai/api/posts?grouped=true&date=2025-01-12"

# Get specific post
curl "https://idir.ai/api/posts/b4e7da2b-1234-5678-90ab-cdef12345678"

# Create post (requires auth cookie)
curl -X POST "https://idir.ai/api/posts" \
  -H "Content-Type: application/json" \
  -b "session=your-session-token" \
  -d '{
    "title": "My Post",
    "content": "# Content",
    "language": "en",
    "category": "insights",
    "status": "draft"
  }'

# Update post
curl -X PUT "https://idir.ai/api/posts/{id}" \
  -H "Content-Type: application/json" \
  -b "session=your-session-token" \
  -d '{"status": "published"}'

# Delete post (owner only)
curl -X DELETE "https://idir.ai/api/posts/{id}" \
  -b "session=your-session-token"

# Upload cover image
curl -X POST "https://idir.ai/api/media" \
  -b "session=your-session-token" \
  -F "file=@image.jpg"
```

---

## 📖 Detailed Endpoint Documentation

### GET /api/posts

List and filter blog posts with flexible query parameters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `grouped` | boolean | Return translation groups (for newsletters) | `true` |
| `date` | YYYY-MM-DD | Filter by published date | `2025-01-12` |
| `category` | string | Filter by category | `insights` |
| `language` | en\|es | Filter by language | `en` |
| `status` | draft\|published | Filter by status (requires auth for draft) | `published` |
| `limit` | number | Max results (default: 50, max: 100) | `20` |

**Standard Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "post-slug",
      "title": "Post Title",
      "excerpt": "...",
      "content": "# Markdown content",
      "cover_image": "https://...",
      "category": "insights",
      "tags": ["AI", "automation"],
      "language": "en",
      "status": "published",
      "published_at": "2025-01-12T10:30:00Z",
      "translation_group_id": "uuid",
      "view_count": 42,
      "read_time_minutes": 5
    }
  ],
  "meta": {
    "count": 1,
    "filters": { /* applied filters */ }
  }
}
```

**Grouped Response** (when `grouped=true`):
```json
{
  "data": [
    {
      "translation_group_id": "uuid",
      "published_at": "2025-01-12T10:30:00Z",
      "en": {
        "id": "uuid",
        "slug": "post-slug",
        "title": "English Title",
        "url": "https://idir.ai/en/blog/post-slug",
        "excerpt": "...",
        "tags": ["AI"],
        "category": "insights"
      },
      "es": {
        "id": "uuid",
        "slug": "post-slug-es",
        "title": "Título en Español",
        "url": "https://idir.ai/es/blog/post-slug-es",
        "excerpt": "...",
        "tags": ["IA"],
        "category": "insights"
      }
    }
  ],
  "meta": {
    "total_groups": 1,
    "with_both_languages": 1,
    "only_english": 0,
    "only_spanish": 0
  }
}
```

---

### POST /api/posts

Create one or more blog posts. Supports both single and bilingual modes.

**Authentication:** Required

**Single Post Mode:**
```json
{
  "title": "Post Title",
  "slug": "optional-custom-slug",
  "content": "# Markdown content",
  "excerpt": "Short summary",
  "cover_image": "https://...",
  "category": "insights",
  "tags": ["AI", "automation"],
  "language": "en",
  "status": "draft",
  "meta_description": "SEO description",
  "meta_keywords": ["ai", "automation"]
}
```

**Bilingual Mode:**
```json
{
  "bilingual": true,
  "title_en": "English Title",
  "content_en": "# English content",
  "content_es": "# Contenido español",
  "cover_image": "https://...",
  "category": "insights",
  "status": "published",
  "en": {
    "excerpt": "English excerpt",
    "tags": "AI, automation",
    "meta_description": "SEO description",
    "meta_keywords": "ai, automation"
  },
  "es": {
    "title": "Título Español",
    "excerpt": "Extracto español",
    "tags": "IA, automatización",
    "meta_description": "Descripción SEO",
    "meta_keywords": "ia, automatización"
  }
}
```

**Response:**
```json
{
  "data": [ /* created post(s) */ ],
  "meta": {
    "bilingual": true,
    "translation_group_id": "uuid"
  }
}
```

---

### GET /api/posts/{id}

Get a single blog post by ID.

**Parameters:**
- `id` (path): Post UUID
- `draft` (query): Include drafts (requires auth)

**Response:**
```json
{
  "data": { /* full post object */ }
}
```

---

### PUT /api/posts/{id}

Update a blog post.

**Authentication:** Required
**Permissions:** Author or Owner

**Request Body:** (partial updates supported)
```json
{
  "title": "Updated Title",
  "status": "published",
  "tags": ["new", "tags"]
}
```

---

### DELETE /api/posts/{id}

Delete a blog post.

**Authentication:** Required
**Permissions:** Owner only

**Response:**
```json
{
  "data": {
    "deleted": true
  }
}
```

---

### POST /api/media

Upload an image for blog posts.

**Authentication:** Required
**Content-Type:** multipart/form-data
**Max Size:** 5MB
**Allowed Formats:** JPEG, PNG, WebP, AVIF, GIF

**Form Data:**
- `file`: Image file

**Response:**
```json
{
  "success": true,
  "url": "https://cymypipxhlgjmrzonpdw.supabase.co/storage/v1/object/public/blog-image/...",
  "path": "2025/01/1234567890-abc123-image.jpg"
}
```

---

## 🔐 Authentication

Write operations require admin authentication via session cookie.

**Login:**
```bash
curl -X POST "https://idir.ai/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' \
  -c cookies.txt
```

Then use the session cookie in subsequent requests:
```bash
curl "https://idir.ai/api/posts" -b cookies.txt
```

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 💡 Best Practices

1. **Use grouped endpoint for newsletters** - `GET /api/posts?grouped=true&date=...`
2. **Filter by date for efficiency** - Don't fetch all posts
3. **Check for null language versions** - Not all groups have both languages
4. **Use translation_group_id** - To link related posts
5. **Cache responses** - Respect API limits
6. **Partial updates** - PUT only sends changed fields
7. **Use query params** - Clean, RESTful filtering

---

## 🎯 Common Use Cases

### Daily Newsletter
```bash
GET /api/posts?grouped=true&date=2025-01-12
```

### Weekly Digest
```python
# Get last 7 days of posts
for day in last_7_days:
    posts = get(f'/api/posts?grouped=true&date={day}')
```

### Category Feed
```bash
GET /api/posts?category=insights&language=en&limit=20
```

### Draft Management
```bash
GET /api/posts?status=draft  # Requires auth
```

---

## 📞 Support

- **Email:** contact@idir.ai
- **Interactive Docs:** https://idir.ai/api/docs
- **OpenAPI Spec:** https://idir.ai/openapi.yaml
