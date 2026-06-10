# Product Requirements Document (PRD)

## AI Presentation Content Generator (JSON-Based)

### Version

1.0

### Product Owner

AI Content Platform Team

### Status

Draft

---

# 1. Product Overview

AI Presentation Content Generator is a SaaS application that helps users generate structured presentation materials from a single topic input.

Instead of generating PowerPoint slides, the system generates a well-structured JSON document containing:

* Presentation title
* Learning objectives
* Target audience
* 7–9 chapters
* Subtopics per chapter
* Key takeaways
* Estimated presentation duration

Example:

User Input:

```text
Basic JavaScript
```

Generated Output:

```json
{
  "title": "Basic JavaScript",
  "learningObjectives": [
    "...",
    "..."
  ],
  "chapters": [
    {
      "chapter": 1,
      "title": "Introduction to JavaScript",
      "topics": [
        "...",
        "..."
      ]
    }
  ]
}
```

This output can later be reused for:

* Slide generation
* LMS content
* Course creation
* Blog generation
* Knowledge base articles

---

# 2. Problem Statement

Creating presentation structures manually takes time.

Users often know the topic but struggle with:

* Organizing learning flow
* Defining chapter hierarchy
* Determining learning objectives
* Ensuring content completeness

AI can automatically generate a structured outline within seconds.

---

# 3. Goals

### Business Goals

* Create AI-powered educational SaaS
* Monetize through credit-based subscriptions
* Minimize AI cost through structured output

### User Goals

* Generate presentation material instantly
* Receive consistent chapter structure
* Export reusable JSON data

---

# 4. Target Users

## Primary

### Teachers

Generate teaching materials quickly.

### Corporate Trainers

Create training outlines.

### Students

Prepare presentations.

### Content Creators

Generate educational content frameworks.

---

# 5. Scope

## MVP

### Included

* Authentication
* Topic input
* AI generation
* JSON output
* Generation history
* Credit system
* OpenRouter integration
* GPT models
* DeepSeek models

### Excluded

* Slide generation
* PPT export
* Images
* Charts
* AI voice
* Multi-language translation

---

# 6. Functional Requirements

---

## FR-001 Generate Content

### Description

User enters a topic.

System generates presentation structure.

### Input

```json
{
  "topic": "Basic JavaScript"
}
```

### Validation

| Rule       | Value |
| ---------- | ----- |
| Required   | Yes   |
| Min Length | 3     |
| Max Length | 200   |

### Acceptance Criteria

* User can submit topic
* Request sent to AI
* Structured JSON returned

---

## FR-002 Model Selection

### Description

User selects AI model.

### Supported Models

| Model    | Credit Cost |
| -------- | ----------- |
| DeepSeek | 3           |
| GPT      | 7           |

### Acceptance Criteria

* Credit deducted before generation
* Request blocked if insufficient credits

---

## FR-003 Generation History

Store every generation.

### Fields

```ts
{
  id: string;
  userId: string;
  topic: string;
  model: string;
  generatedJson: Json;
  creditsUsed: number;
  createdAt: Date;
}
```

### Acceptance Criteria

* User can view history
* User can reopen generated content

---

## FR-004 Revision Feature

### Description

Each generated material includes revision quota.

### Rule

Maximum:

```text
3 revisions per generation
```

Revision examples:

```text
Add chapter about DOM Manipulation

Make it suitable for beginners

Reduce duration to 30 minutes
```

### Acceptance Criteria

* User can revise generated content
* Maximum 3 revisions
* No additional credit consumed

---

## FR-005 JSON Validation

System validates AI output.

If invalid:

```text
Retry automatically
```

Maximum retry:

```text
2 times
```

If still invalid:

```text
Generation failed
```

---

# 7. AI Generation Flow

```text
User Input
    ↓
Validate Input
    ↓
Check Credits
    ↓
Deduct Credits
    ↓
Send Prompt To OpenRouter
    ↓
Receive JSON
    ↓
Validate JSON
    ↓
Store Database
    ↓
Return Response
```

---

# 8. JSON Output Contract

This is the required schema.

```json
{
  "title": "",
  "description": "",
  "targetAudience": "",
  "presentationDuration": 60,
  "learningObjectives": [],
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "",
      "description": "",
      "topics": [],
      "keyTakeaways": []
    }
  ],
  "summary": "",
  "prerequisites": []
}
```

---

# 9. Example Output

```json
{
  "title": "Basic JavaScript",
  "description": "Introduction to JavaScript programming language",
  "targetAudience": "Beginners",
  "presentationDuration": 90,
  "learningObjectives": [
    "Understand JavaScript fundamentals",
    "Write basic scripts",
    "Manipulate variables"
  ],
  "prerequisites": [
    "Basic computer knowledge"
  ],
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Introduction to JavaScript",
      "description": "History and overview",
      "topics": [
        "What is JavaScript",
        "History",
        "Use Cases"
      ],
      "keyTakeaways": [
        "JavaScript is a scripting language"
      ]
    }
  ],
  "summary": "Basic JavaScript overview"
}
```

---

# 10. Non-Functional Requirements

## Performance

| Requirement     | Value    |
| --------------- | -------- |
| Generation Time | < 30 sec |
| API Response    | < 35 sec |
| History Load    | < 2 sec  |

---

## Reliability

* Automatic retry for invalid JSON
* AI timeout handling
* Credit rollback on failure

---

## Security

* Authentication required
* Rate limiting
* Input sanitization
* Server-side credit validation

---

# 11. Suggested Tech Stack

## Frontend

### Next.js 15

Features:

* App Router
* Server Components
* Suspense

### UI

* shadcn/ui
* Tailwind CSS

---

## Backend

### tRPC

Responsibilities:

* Type-safe API
* Validation
* Protected procedures

### Zod

Input/output validation.

---

## Database

### PostgreSQL

---

## ORM

### Prisma

or

### Drizzle ORM

(Drizzle recommended for better type inference with tRPC)

---

## Authentication

### Better Auth

Tables:

```text
users
sessions
accounts
```

---

## AI

### OpenRouter

Supported:

* GPT models
* DeepSeek models

---

## Queue (Future)

### Trigger.dev

For:

* Long-running generations
* Retry handling
* Background processing

---

# 12. Database Schema

## users

```ts
id
name
email
credits
createdAt
```

---

## generations

```ts
id
userId
topic
model
generatedJson
revisionCount
creditsUsed
status
createdAt
updatedAt
```

---

## revisions

```ts
id
generationId
prompt
generatedJson
createdAt
```

---

## credit_transactions

```ts
id
userId
amount
type
description
createdAt
```

Types:

```text
PURCHASE
GENERATION
REFUND
```

---

# 13. Future Roadmap

### V1

* Topic → JSON outline

### V2

* Topic → Detailed chapter content

### V3

* Topic → Speaker notes

### V4

* Topic → Slide content JSON

### V5

* Export PPTX

### V6

* AI-generated diagrams

### V7

* AI-generated presentation deck with professional design

---

# Recommended LLM Prompt

For consistent output, force JSON mode:

```text
You are an expert instructional designer.

Generate a presentation structure about the given topic.

Rules:
- Return valid JSON only.
- No markdown.
- No explanations.
- Generate 7-9 chapters.
- Each chapter must contain:
  - title
  - description
  - 3-5 topics
  - keyTakeaways
- Include learning objectives.
- Include prerequisites.
- Include summary.
- Target audience must be inferred.
- Presentation duration between 60-120 minutes.

Topic:
{{topic}}
```

This architecture is scalable enough to support your future roadmap of "AI Material Generator → AI Slide Generator → PPT Export" without redesigning the database or API structure.