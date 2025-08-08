This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Share Recipe - Dev Setup

## Backend

1. Create .env in `backend/app/config` (DATABASE_URL, JWT secrets).
2. Create DB and run migrations:

```bash
# from repo root
cd share-recipe-frontend/backend
# If autogenerate fails due to categories FK, we've removed the FK in models; then:
alembic revision --autogenerate -m "sync models"
alembic upgrade head
```

3. Start API:

```bash
uvicorn app.main:app --reload
```

API base: http://localhost:8000
- Static media is served under /media

## Frontend

```bash
cd ../
npm install
npm run dev
```

App: http://localhost:3000

## Environment

Set API base for the frontend:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then restart the dev server.

## Features added
- Saved Recipes page at `/recipes/saved` (requires sign-in).
- Centralized API base URL via `src/lib/config.js`.
- Comments on recipe detail page (view and post).

## Notes
- Auth: JWT in localStorage (access/refresh).
- Upload endpoints:
  - POST /api/user/profile/photo/
  - POST /api/recipes/recipe/{id}/image/
- Recipes:
  - POST /api/recipes/create/
  - GET /api/recipes/list/
  - GET /api/recipes/my-recipes/
  - GET /api/recipes/saved/
  - GET/PATCH/DELETE /api/recipes/recipe/{id}/
- Social:
  - POST/DELETE /api/recipes/recipe/{id}/like/
  - POST/DELETE /api/recipes/recipe/{id}/save/
- Comments:
  - GET/POST /api/recipes/recipe/{id}/comments/
