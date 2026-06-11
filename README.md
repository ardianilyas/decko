# Decko

Decko is an AI-powered presentation generator that creates highly descriptive, deeply structured presentation outlines from a simple topic prompt.

## Features

- **AI-Powered Generation**: Instantly generate structured presentation outlines including learning objectives, prerequisites, and chapters.
- **Multilingual Support**: Generate presentations natively in English or Bahasa Indonesia.
- **Deep Content**: Detailed summaries and highly descriptive topics/code examples generated for every chapter.
- **AI Revisions**: Refine and tweak your presentation with prompt-based revisions.
- **Export Ready**: Copy your generated presentation directly into a clean, human-readable text format for PowerPoint, Word, or Google Slides.
- **Credit System**: Track usage and model costs seamlessly.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **API**: [tRPC](https://trpc.io/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) and [OpenRouter](https://openrouter.ai/)

## Getting Started

First, copy the `.env.example` file to `.env.local` and add your keys:

```bash
cp .env.example .env.local
```

Required Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: A secure random string for authentication.
- `BETTER_AUTH_URL`: Your local or production URL (e.g. `http://localhost:3000`).
- `OPENROUTER_API_KEY`: API Key for AI generation.

Run database migrations:

```bash
npx drizzle-kit push
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
