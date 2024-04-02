# Fullstack Trello Clone: Next.js 14, Server Actions, React, Prisma, Tailwind, Shadcn.ui, Supabase

This is repository for Fullstack Trello Clone: Next.js 14, Server Actions, React, Prisma, Tailwind, Shadcn.ui, Supabase

### Key Features:

- Auth
- Workspaces
- Board creation
- Unsplash API for beautiful cover images
- Board rename and delete
- List creation
- List rename, delete, drag & drop reorder and copy
- Card creation
- Card rename, description, duedate, checklist, attachement, delete, drag & drop reorder and copy
- Supabase DB and Storage
- Prisma ORM
- shadcnUI and TailwindCSS

### Prerequisites

Node version 18.x.x

### Git clone

```bash
https://github.com/sangkukbae/trello-clone.git
```

### Install package

```bash
npm install
```

### Setup .env file

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Setup Prisma

```bash
npx prisma generate
npx prisma db push
```

### Start the app

```bash
npm run dev
```
