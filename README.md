# 🐕 Woof Woof Walkies

A modern, full-stack web application for dog walkers to plan, log, and revisit their favorite walking routes. Built with Next.js 15, TypeScript, React, and Supabase.

## 🎯 Project Purpose

This is a **learning-focused portfolio project** demonstrating modern full-stack development practices with cutting-edge technologies. The goal is to showcase professional development patterns, accessibility-first design, and test-driven development while building a practical application.

## ✨ Features

- 🔐 **User Authentication** - Email/password login with Supabase Auth
- ✏️ **Full CRUD Operations** - Create, read, update, and delete walks
- 🔍 **Advanced Filtering** - Search by name, difficulty, and distance with URL-based state
- ⚡ **Optimistic UI Updates** - Instant feedback with automatic rollback on errors
- 📱 **Responsive Design** - Mobile-first, accessible interface
- 🧪 **Test-Driven Development** - Comprehensive test coverage with Vitest

## 🔒 Security by Default

This application is built with security as a core principle, leveraging modern tools that provide protection out-of-the-box:

- **SQL Injection Protection** - Supabase client library uses parameterized queries internally, making SQL injection attacks impossible. All database queries are automatically sanitized at the driver level.

- **Row-Level Security (RLS)** - PostgreSQL policies enforce data access at the database level. Users can only view and modify their own walks, even if client-side checks are bypassed.

- **XSS Prevention** - React automatically escapes all rendered content, preventing cross-site scripting attacks. User-generated content is safely displayed as text, not executable code.

- **Server-Side Authentication** - All sensitive operations require server-side auth validation using Supabase's server client. Authentication checks happen on the server, not just in the browser.

- **Type Safety** - TypeScript provides compile-time validation, catching potential security issues during development before they reach production.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Patterns:** React Server Components & Client Components
- **State Management:** React hooks (useState, useOptimistic, useTransition)

### Backend
- **Database:** PostgreSQL (via Supabase)
- **API:** Supabase Auto-generated REST API
- **Authentication:** Supabase Auth
- **Server Actions:** Next.js Server Actions

### Testing & Development
- **Testing:** Vitest + React Testing Library
- **Development Approach:** Test-Driven Development (TDD)
- **Code Quality:** TypeScript strict mode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SamOllason/woof-woof-walkies.git
cd woof-woof-walkies
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## � Deployment

This project is designed for zero-config deployment on Vercel:

1. Push your code to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Vercel auto-detects Next.js configuration and enables automatic deployments on every push.

## �📚 Documentation

- [Project Specification](./documentation/specification.md) - Detailed requirements and technical decisions
- [Development Roadmap](./documentation/roadmap.md) - Feature progress and planning
- [Architecture Diagrams](./documentation/architecture/) - Component architecture and data flow
- [GitHub Copilot Instructions](./.github/copilot-instructions.md) - Development guidelines and patterns

## 🎓 Learning Focus Areas

This project emphasizes:

- **Modern React Patterns** - Server Components, Client Components, Server Actions, useOptimistic
- **Accessibility First** - WCAG AA compliance, semantic HTML, keyboard navigation
- **Test-Driven Development** - Writing tests before implementation
- **TypeScript Best Practices** - Strict mode, proper typing, type safety
- **Database Security** - Row-Level Security policies, server-side validation
- **Progressive Enhancement** - Works without JavaScript where possible
- **Performance Optimization** - Server-side rendering, optimistic updates, debouncing

## 📝 License

MIT

## 👤 Author

**Sam Ollason**
- GitHub: [@SamOllason](https://github.com/SamOllason)

---

*Built with ❤️ as a portfolio and learning project*
