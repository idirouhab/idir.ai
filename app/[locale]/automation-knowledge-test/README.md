# Automation Skills Diagnostic

A professional diagnostic assessment to determine technical placement from Digital Discovery to AI/Agent Architect.

## Overview

The Automation Skills Diagnostic is a professional placement test that supports 4 question types:
- **yes_no**: Binary choice questions (Yes/No)
- **multiple_choice**: Single choice questions (can include optional contextData for JSON display)
- **text**: Free-form text responses with character limits
- **code**: Code challenges with simplified format (primarily JavaScript)

## Features

- ✅ **Professional Diagnostic**: Determines placement level and recommends learning path
- ✅ **User Registration**: Collects name and email with GDPR compliance
- ✅ **Immediate Feedback**: Users see if they're correct after each answer
- ✅ **Skip Questions**: Users can skip questions they don't know (helps accurate placement)
- ✅ **5 Skill Areas**: From foundations to AI/MCP orchestration
- ✅ **4 Placement Levels**: Digital Discovery, No-Code Builder, Technical Automator, AI/Agent Architect
- ✅ **Course Path Recommendations**: Each level includes recommended learning path
- ✅ **GDPR Compliant**: Mandatory consent checkbox with clear data processing disclosure
- ✅ **Multi-language Support**: English and Spanish (via next-intl)
- ✅ **Professional UI**: Clean, focused design for serious assessment
- ✅ **SEO Optimized**: Full metadata, OpenGraph images, structured data
- ✅ **Responsive Design**: Mobile-first, works on all devices

## Setup

### 1. Environment Variable

Add to your `.env.local`:

```bash
TEST_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/automation-test
```

### 2. Webhook API Requirements

Your webhook must support two endpoints via query parameters:

#### Get Questions: `?questions=true`

**Request:**
```
GET https://your-webhook-url?questions=true
```

**Response Format:**
```json
{
  "assessment": {
    "id": "persona-diagnostic-v3",
    "title": "Technical & AI Automation Diagnostic",
    "description": "Determines placement from 'Total Beginner' to 'AI/MCP Architect'.",
    "estimatedTime": "20-30 minutes",
    "totalPoints": 50,
    "version": "2.0"
  },
  "sections": [
    {
      "id": "s1-foundations",
      "title": "Data & API Foundations",
      "difficulty": "Easy",
      "description": "Tests basic understanding of how systems communicate."
    }
  ],
  "questions": [
    {
      "id": "q1",
      "sectionId": "section-a",
      "type": "yes_no",
      "points": 1,
      "question": "Can a workflow automation be triggered by an event?",
      "options": [
        { "id": "yes", "label": "Yes" },
        { "id": "no", "label": "No" }
      ]
    }
  ],
  "scoring": {
    "levels": [
      {
        "id": "beginner",
        "label": "Beginner",
        "minScore": 0,
        "maxScore": 10,
        "description": "Needs foundational training"
      }
    ]
  }
}
```

**Important:** Do NOT include `correctAnswer`, `acceptedVariations`, or `sampleSolution` fields. The API route automatically strips these before sending to the client.

#### Submit Answer: `?result=true`

**Request:**
```
POST https://your-webhook-url?result=true
Content-Type: application/json

{
  "questionId": "q1",
  "answer": "yes"
}
```

**Response Format:**
```json
{
  "correct": true,
  "explanation": "Yes, workflows can be triggered by external events like webhooks, scheduled times, or system events.",
  "pointsEarned": 1
}
```

#### Get Final Results: `POST` with all answers

**Request:**
```
POST https://your-webhook-url?result=true
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "answers": {
    "q1": "yes",
    "q2": "b",
    "q3": "Text answer here..."
  },
  "finalScore": 24
}
```

**Response Format:**
```json
{
  "score": 24,
  "maxScore": 36,
  "percentage": 66.67,
  "level": {
    "id": "intermediate",
    "label": "Intermediate",
    "minScore": 21,
    "maxScore": 28,
    "description": "Can build and maintain production workflows"
  },
  "breakdown": [
    {
      "sectionId": "section-a",
      "sectionTitle": "Fundamentals",
      "score": 3,
      "maxScore": 4
    }
  ]
}
```

## Question Types

### 1. Yes/No Questions

```typescript
{
  "id": "q1",
  "type": "yes_no",
  "points": 1,
  "question": "Can workflows be triggered by external events?",
  "options": [
    { "id": "yes", "label": "Yes" },
    { "id": "no", "label": "No" }
  ]
}
```

### 2. Multiple Choice

```typescript
{
  "id": "q2",
  "type": "multiple_choice",
  "points": 2,
  "question": "What is the primary purpose of a trigger?",
  "options": [
    { "id": "a", "label": "Transform data" },
    { "id": "b", "label": "Initiate workflow" },
    { "id": "c", "label": "Store variables" },
    { "id": "d", "label": "Send notifications" }
  ]
}
```

**With Context Data:**
```typescript
{
  "id": "q6",
  "type": "multiple_choice",
  "points": 2,
  "question": "Given the JSON structure below, which expression correctly retrieves the 'total' amount of the SECOND order?",
  "contextData": {
    "customer": {
      "orders": [
        { "id": "ORD-01", "total": 100 },
        { "id": "ORD-02", "total": 250 },
        { "id": "ORD-03", "total": 400 }
      ]
    }
  },
  "options": [
    { "id": "a", "label": "customer.orders[0].total" },
    { "id": "b", "label": "customer.orders[1].total" },
    { "id": "c", "label": "customer.orders.second().total" },
    { "id": "d", "label": "customer.orders.total[1]" }
  ]
}
```

### 3. Text Questions

```typescript
{
  "id": "q3",
  "type": "text",
  "points": 1,
  "question": "Explain what an API is and why it's relevant.",
  "placeholder": "Enter your explanation here...",
  "minLength": 50,  // Note: minLength is ignored in validation, only maxLength enforced
  "maxLength": 500,
  "evaluationCriteria": [
    "Mentions communication between systems",
    "Explains integration capabilities",
    "Relates to automation context"
  ]
}
```

**Note:** While `minLength` is included in the question data for reference, the UI does not enforce a minimum character count. Users can submit text of any length up to `maxLength`, or skip the question entirely.

### 4. Code Questions

**Simplified Format (New in v2.0):**
```typescript
{
  "id": "q3",
  "type": "code",
  "points": 10,
  "question": "Write a small JavaScript expression to convert 'total_price' to a number and multiply by 1.2.",
  "languages": [
    {
      "id": "javascript",
      "template": "return parseFloat(total_price) * 1.2;"
    }
  ]
}
```

**Note:** The simplified format omits:
- `label` (optional, defaults to uppercase language ID)
- `inputExample` and `expectedOutput` (optional)
- `evaluationCriteria` (optional)

**Full Format (Still Supported):**
```typescript
{
  "id": "q10",
  "type": "code",
  "points": 3,
  "question": "Write a function to transform user data.",
  "inputExample": [
    { "first_name": "Ana", "last_name": "García" }
  ],
  "expectedOutput": [
    { "fullName": "Ana García" }
  ],
  "languages": [
    {
      "id": "javascript",
      "label": "JavaScript",
      "template": "function transform(users) {\n  // Your code here\n}"
    }
  ],
  "evaluationCriteria": [
    "Correctly maps over array",
    "Concatenates names"
  ]
}
```

Answer format:
```json
{
  "language": "javascript",
  "code": "return parseFloat(total_price) * 1.2;"
}
```

## File Structure

```
app/[locale]/automation-knowledge-test/
├── page.tsx                          # Server component with SEO metadata
├── AutomationTest.tsx                # Main client component
├── types.ts                          # TypeScript type definitions
├── opengraph-image.tsx               # OG image for social sharing
├── README.md                         # This file
└── components/
    ├── WelcomeScreen.tsx             # Initial welcome screen
    ├── QuestionRenderer.tsx          # Router for question types
    ├── YesNoQuestion.tsx             # Yes/No question component
    ├── MultipleChoiceQuestion.tsx    # Multiple choice component (with optional contextData display)
    ├── TextQuestion.tsx              # Text input with validation
    ├── CodeQuestion.tsx              # Code editor component
    ├── FeedbackPanel.tsx             # Answer feedback display
    └── ResultsScreen.tsx             # Final results display

app/api/automation-test/
└── route.ts                          # API proxy with answer stripping
```

## Placement Levels

Diagnostic placement levels (from test_2.json):

- **Digital Discovery** (0-5 points): Focus on web fundamentals, APIs, HTTP, JSON
  - Recommended Path: "Foundations of the Web"

- **No-Code Builder** (6-15 points): Knows APIs but needs workflow logic
  - Recommended Path: "Workflow Architecture"

- **Technical Automator** (16-30 points): Strong logic, needs JavaScript for advanced features
  - Recommended Path: "The Scripting Layer"

- **AI/Agent Architect** (31-50 points): Ready for AI orchestration and MCP deployment
  - Recommended Path: "AI Infrastructure & MCP"

Each level includes a `coursePath` field with the recommended learning path.

## Customization

### Change Colors

Edit the constants in `AutomationTest.tsx`:

```typescript
const ACCENT = '#11b981';        // Emerald green
const SECOND_ACCENT = '#0055ff';  // Blue
```

### Add Question Types

1. Create new component in `components/`
2. Add type to `types.ts`
3. Update `QuestionRenderer.tsx` with new case
4. Add validation logic in `AutomationTest.tsx`

### Modify Translations

Edit `messages/en.json` and `messages/es.json` under the `automationTest` key.

## User Registration & GDPR Compliance

### Registration Form

Before starting the diagnostic, users must provide:

1. **Full Name** (required)
   - Client-side validation: Must not be empty
   - Trimmed before submission

2. **Email Address** (required)
   - Client-side validation: Must be valid email format
   - Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Trimmed before submission

3. **GDPR Consent** (required)
   - Must be explicitly checked
   - Consent text (EN): "I consent to the processing of my personal data for the purpose of receiving my diagnostic results and related educational recommendations. My data will be handled in accordance with GDPR regulations."
   - Consent text (ES): "Doy mi consentimiento para el procesamiento de mis datos personales con el fin de recibir mis resultados diagnósticos y recomendaciones educativas relacionadas. Mis datos serán tratados de acuerdo con las regulaciones GDPR."

### Validation

All fields show real-time validation:
- Red border for invalid/empty required fields
- Error messages below each field
- Form cannot be submitted until all validations pass

### Data Handling

User data is:
1. Collected on the welcome screen
2. Stored in component state during the diagnostic
3. Submitted with final results to the webhook
4. **Not stored in browser localStorage or cookies**
5. **Not persisted in the app database**

The webhook is responsible for:
- Storing user data securely
- Sending results via email
- Managing GDPR data subject rights (access, deletion, etc.)

## Testing

1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/en/automation-knowledge-test`
3. Fill in name, email, and accept GDPR consent
4. Test all question types
5. Verify immediate feedback works
6. Check results screen displays correctly
7. Verify user data is sent with final submission

## Deployment

The test page is deployed with your Next.js app. Make sure:

1. `TEST_WEBHOOK_URL` is set in production environment variables
2. Webhook endpoint is accessible and returns correct formats
3. CORS is configured if webhook is on different domain

## Performance

- Server-side rendering for SEO
- Client-side state management for smooth UX
- Lazy loading for components
- Optimized images and fonts
- Edge runtime for OG images

## Accessibility

- Semantic HTML
- Keyboard navigation support
- Focus states for all interactive elements
- ARIA labels where needed
- Color contrast ratios meet WCAG AA standards

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Part of idir.ai project.
