# Project Specification

## Project Overview
<!-- Brief description of what the application does and its purpose -->
**Project Name:** Woof woof walkies
**Type:** Full stack React TypeScript Web Application.
**Description:** [1-2 paragraphs describing the app]

## Some more context

The core purpose of this project is for me to keep learning and understanding and growing my skills.

I am a senior software engineer who has worked with React, TypeScript, Node, Mongo but not for several years.

I want to increase my understanding of cutting edge and modern full stack development with React, TypeScript and PostGresSQL, while also creating a relatively simple project for my portfolio.

Bearing that in mind, I want you to be my tutor and guide me through creating this application each step of the way, presenting me the pros and cons of each choice. Please explain things me like a fellow senior engineer.

I want to take a TDD approach where possible.

## Philosophy

**Keep It Simple:** Start with the simplest solution that works. Add complexity (state management, caching libraries, etc.) only when there's a clear need. This is a learning project - focus on fundamentals first.

## Core User Stories
<!-- Describe what users should be able to do -->
- 1) Add a walk: As a dog walker, I want to add new walks to be saved so that I can refer to them in the future
- 2) Log an instance of walk: As a dog walker, I want to log an instance of a previously saved walk so that I can see how often I visit certain places and see trends over time favourites.
- 3) Admin all walks for all users: As an admin, I want to be able to see all walks for all users in one central place.

## Technical Requirements

### Frontend
- **Framework:** Next.js 14+ (App Router) with React 18+
- **Language:** TypeScript
- **Build Tool:** Next.js built-in (Turbopack in dev)
- **Styling:** Tailwind CSS
- **State Management:** React built-in (useState, Server Components) - add libraries only if needed
- **Routing:** Next.js App Router (file-based routing)

### Backend/API
- **Type:** Supabase (PostgreSQL + Auto-generated REST API)
- **Database:** PostgreSQL (hosted by Supabase)
- **Authentication:** Supabase Auth (email/password + OAuth)
- **Authorization:** Row-Level Security (RLS) policies
- **Real-time:** Supabase Realtime subscriptions

### Key Dependencies
- **@supabase/supabase-js**: Supabase client SDK
- **@supabase/ssr**: Server-side auth for Next.js
- **tailwindcss**: Utility-first CSS framework
- **vitest**: Testing framework (faster than Jest)
- **@testing-library/react**: Component testing
- **typescript**: Type safety
- **react-hot-toast**: Toast notifications for user feedback

**Note:** Start minimal. Add libraries (React Query, Zustand, etc.) only when complexity demands it.

## Portfolio-Worthy Technical Features

This project demonstrates several advanced patterns and best practices that showcase modern React development expertise:

### 1. Optimistic UI Updates
**What it demonstrates:** Advanced React patterns for responsive user experiences

The application implements optimistic UI updates using React's `useOptimistic` hook, providing instant feedback to users without waiting for server confirmation.

**Key implementation details:**
- **Immediate UI Response**: When a user deletes a walk, it's removed from the UI instantly
- **Background Sync**: The actual server request happens in the background
- **Automatic Rollback**: If the server request fails, React automatically reverts the UI change
- **Error Handling**: Toast notifications inform users of success/failure
- **Visual Feedback**: `useTransition` shows pending states with dimmed UI during operations

**Code pattern:**
```typescript
const [optimisticWalks, removeOptimisticWalk] = useOptimistic(
  initialWalks,
  (currentWalks, walkIdToDelete: string) => {
    return currentWalks.filter(walk => walk.id !== walkIdToDelete)
  }
)

async function handleDelete(walkId: string) {
  removeOptimisticWalk(walkId)  // Instant UI update
  try {
    await onDelete(walkId)       // Background server sync
    toast.success('Walk deleted successfully')
  } catch (error) {
    // React auto-reverts, we show error
    toast.error('Failed to delete walk. Please try again.')
  }
}
```

**Why it matters:**
- Shows understanding of perceived performance vs actual performance
- Demonstrates complex state management with graceful error handling
- Balances user experience with data integrity
- Production-ready pattern used by companies like Twitter, Facebook

### 2. React Server Components Architecture
**What it demonstrates:** Modern Next.js 15 patterns and understanding of client/server boundaries

The application properly separates Server Components (for data fetching) from Client Components (for interactivity), optimizing bundle size and performance.

**Key patterns:**
- Server Components fetch data at the edge with zero client JavaScript
- Client Components marked with `'use client'` handle interactivity
- Server Actions (`'use server'`) enable type-safe mutations
- Proper props passing between server and client boundaries

### 3. Test-Driven Development (TDD)
**What it demonstrates:** Professional engineering discipline and code quality practices

All features implemented following TDD principles:
- Write failing tests first
- Implement minimum code to pass
- Refactor with confidence
- 100+ test coverage including optimistic update scenarios

**Test coverage includes:**
- Component rendering and interaction
- Optimistic update behavior
- Error rollback scenarios
- Toast notification triggers
- Edge cases (empty states, cancellations)

### 4. Type-Safe Database with Row-Level Security
**What it demonstrates:** Security-first development and PostgreSQL expertise

- Supabase RLS policies ensure users can only access their own data
- TypeScript types generated from database schema
- Server-side auth validation on every request
- Protection against IDOR (Insecure Direct Object Reference) attacks

### 5. Modern Form Handling
**What it demonstrates:** Progressive enhancement and accessibility

- Server Actions for form submissions (works without JavaScript)
- Client-side validation for immediate feedback
- Consistent error handling patterns
- NEXT_REDIRECT handling for post-mutation navigation

