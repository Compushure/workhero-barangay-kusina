# WorkHero Barangay Kusina - Employee Management System

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Supabase](https://img.shields.io/badge/Supabase-latest-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive employee management and gamification system built with Next.js 16, Supabase, and modern UI components. Features role-based access control for superadmins, managers, HR professionals, and regular employees, with integrated task assignment, badge system, attendance tracking, and reward redemption.

---

## 📚 Table of Contents

<details open>
<summary><strong>Quick Links</strong></summary>

- [🎯 Features](#features)
- [📦 Tech Stack](#tech-stack)
- [📋 Prerequisites](#prerequisites)
- [📥 Installation](#installation)
- [🔐 Environment Setup](#environment-setup)
- [🚀 Running the Application](#running-the-application)
- [📜 Available Scripts](#available-scripts)
- [🧪 Testing](#testing)
- [🏗️ Project Architecture](#architecture)
- [🔧 Quirks & Special Configurations](#quirks--special-configurations)
- [🎨 Styling & UI](#styling--ui)
- [📥 Path Aliases](#path-aliases)
- [📈 Deployment](#deployment)
- [🔄 Pull Request Process](#pull-request-process)
- [⚠️ Common Pitfalls](#common-pitfalls)
- [📚 Key Technologies Deep Dive](#key-technologies-deep-dive)
- [📖 Documentation & Resources](#documentation--resources)
- [📄 License](#license)
- [🤝 Contributing](#contributing)
- [📞 Support](#support)

</details>

---

## 🎯 Features

- **Role-Based Views**: Superadmin, Manager, HR, and Employee roles with tailored dashboards
- **Employee Management**: Comprehensive user management system with advanced filtering and search
- **Task Management**: Assign, track, and verify tasks with manager verification workflows
- **Badge Gamification System**: Dynamic badge creation and assignment to recognize employee achievements
- **Attendance Tracking**: Log and manage employee attendance with HR adjustment capabilities
- **Reward System**: Employees earn points through achievements and redeem them for rewards
- **Real-time Notifications**: Live notification system using Supabase real-time subscriptions
- **Merchant Integration**: Built-in reward redemption marketplace (Mercado)
- **Advanced Filtering & Search**: Search employees by name, ID, role, employment status
- **Responsive UI**: Built with shadcn/ui components and Tailwind CSS 4
- **Type-Safe Development**: Full TypeScript support with strict type checking
- **Comprehensive Testing**: Jest unit tests and Cypress E2E tests

<details>
<summary><strong>📦 Tech Stack</strong></summary>

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org) - React-based framework with SSR/ISR capabilities
- **Language**: [TypeScript 5](https://www.typescriptlang.org) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework with CSS variables
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) - Accessible, unstyled component primitives
- **Forms**: [React Hook Form](https://react-hook-form.com) - Performant form state management
- **Validation**: [Zod](https://zod.dev) - TypeScript-first schema validation
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs) - Lightweight state management

### Data & Server
- **Backend**: [Supabase](https://supabase.com) - Open-source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & Authorization
  - Storage for file uploads
  - Edge Functions for serverless compute
- **Server Actions**: Next.js Server Actions with `'use server'` directive
- **Data Fetching**: [TanStack Query (React Query) 5](https://tanstack.com/query) - Server state management, caching, and synchronization

### Development & Testing
- **Build Tool**: Turbopack (Next.js default)
- **Testing**: [Jest 29](https://jestjs.io) - Unit and integration testing
- **E2E Testing**: [Cypress 15](https://www.cypress.io) - End-to-end testing framework
- **Linting**: [ESLint 4](https://eslint.org) - Code quality and consistency
- **Code Formatting**: [Prettier 3](https://prettier.io) - Code formatter
- **Git Hooks**: [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/okonet/lint-staged) - Pre-commit hooks

### Utilities
- **Date Handling**: [date-fns](https://date-fns.org) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) - Date manipulation with timezone support
- **Animations**: [Framer Motion](https://www.framer.com/motion) + [GSAP](https://greensock.com/gsap) - Animation libraries
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful SVG icon library
- **Notifications**: [Sonner](https://sonner.emilkowal.ski) - Toast notification system
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring
- **CLI**: [Cross-env](https://github.com/kentcdodds/cross-env) - Cross-platform environment variables

</details>

<details>
<summary><strong>📋 Prerequisites</strong></summary>

Before you begin, ensure you have the following installed:

- [**Node.js**](https://nodejs.org/) (v18.x or higher)
- [**npm**](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)
- [**Git**](https://git-scm.com/) - Version control
- [**Supabase Account**](https://supabase.com/) - For backend services
- [**Docker**](https://www.docker.com/) (optional) - For Supabase Edge Functions deployment

</details>

<details>
<summary><strong>📥 Installation</strong></summary>

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/workhero-barangay-kusina.git
cd workhero-barangay-kusina
```

2. **Install dependencies**:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

</details>

<details>
<summary><strong>🔐 Environment Setup</strong></summary>

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3008

# Email (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_login
SMTP_KEY=your_brevo_smtp_key
SMTP_ALLOW_SELF_SIGNED=true
SMTP_FROM="Compushure <tonilegayada@gmail.com>"
```

> **⚠️ Important**: The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client. It's only used in server-side code.

### Environment Variables Explained

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public API key (public) |
| `SUPABASE_URL` | Supabase URL for admin operations (server-side only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for elevated permissions (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Application URL for callbacks and redirects |
| `SMTP_HOST` | Brevo SMTP host (`smtp-relay.brevo.com`) |
| `SMTP_PORT` | Brevo SMTP port (`587` recommended) |
| `SMTP_USER` | Brevo SMTP login email (e.g., `a593f3001@smtp-brevo.com`) |
| `SMTP_KEY` | Brevo SMTP key (not API key) |
| `SMTP_ALLOW_SELF_SIGNED` | Set `true` only if TLS interception/self-signed certs block mail |
| `SMTP_FROM` | From header, e.g., `"Compushure <tonilegayada@gmail.com>"` |

</details>

<details>
<summary><strong>🚀 Running the Application</strong></summary>

### Development Mode

```bash
npm run dev
```

This starts the development server at [http://localhost:3008](http://localhost:3008) with hot-reload enabled.

### Production Build

```bash
npm run build
npm run start
```

Builds the application for production and starts the server.

### Type Checking

```bash
npm run typecheck
```

Validates TypeScript types without emitting files.

### Linting & Formatting

```bash
npm run lint      # Run ESLint
npm run format    # Format with Prettier
npm run format:check  # Check formatting without changes
```

</details>

<details>
<summary><strong>📜 Available Scripts</strong></summary>

```json
{
  "dev": "next dev -p 3008",                    // Start dev server on port 3008
  "test": "cross-env NODE_ENV=test jest --runInBand",  // Run Jest tests
  "test:watch": "jest --watch",                 // Run tests in watch mode
  "build": "cross-env NODE_ENV=production next build",  // Production build
  "start": "next start",                        // Start production server
  "lint": "eslint .",                           // Run ESLint
  "format": "prettier --write .",               // Format code
  "format:check": "prettier --check .",         // Check formatting
  "typecheck": "tsc --noEmit",                  // TypeScript validation
  "smtp:verify": "node scripts/smtp-verify.js"  // Verify Brevo SMTP transport with .env.local
}
```

</details>

<details>
<summary><strong>🧪 Testing</strong></summary>

### Jest Unit & Integration Tests

Jest is configured for testing server actions, utilities, and component logic. Tests run with `NODE_ENV=test`.

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch
```

**Jest Configuration**:
- **Environment**: Node.js
- **Transform**: ts-jest (TypeScript support)
- **Module Paths**: Path aliases (@/* mapped to src/*)
- **Setup**: jest.setup.ts for global test configuration

**Test Files Location**: `__tests__/` directory at project root

Example test files:
- `__tests__/superadmin.test.ts` - Superadmin features
- `__tests__/badge-editor.test.ts` - Badge creation and verification
- `__tests__/badge-assignment.test.ts` - Badge assignment workflow
- `__tests__/task-verification.test.ts` - Task verification logic

### Cypress End-to-End Tests

Cypress provides visual, interactive E2E testing for the user interface.

```bash
# Open Cypress Test Runner (interactive GUI)
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run
```

**Cypress Configuration**:
- Located in `cypress.config.ts`
- Supports TypeScript test files
- Fixtures in `cypress/fixtures/`
- Custom commands in `cypress/support/commands.ts`

**Test Files Location**: `cypress/e2e/` directory

</details>

<details>
<summary><strong>🏗️ Project Architecture</strong></summary>

### Architectural Overview

The application follows a **modular, role-based architecture** with clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
│  (React Components → Components/Hooks → Action Handlers)        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  (Server Components/Actions → Database Logic → Validation)      │
└────────────────────────────┬────────────────────────────────────┘
                             │ Queries/Mutations
┌────────────────────────────▼────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
│  (PostgreSQL DB | Real-time | Auth | Storage | Edge Functions) │
└─────────────────────────────────────────────────────────────────┘
```

### 3-Layer Server Actions Pattern

The application uses a consistent 3-layer pattern for all server-side operations:

<details>
<summary><strong>1. Actions Layer</strong></summary>

Direct database operations
   - Server Actions with `'use server'` directive
   - Direct Supabase client calls
   - Database validation and business logic
   - Return `ServerActionResponse<T>` for type safety

</details>

<details>
<summary><strong>2. Action Handlers Layer</strong></summary>

Client-side wrappers
   - Wrap actions with `safeAction()` helper
   - Handle UI feedback (toast notifications via `sonner`)
   - Error handling and user messaging
   - Optional optimistic updates

</details>

<details>
<summary><strong>3. TanStack Query Hooks Layer</strong></summary>

React Query integration
   - **Queries** (`queries/`) - Data fetching and caching
   - **Mutations** (`mutations/`) - Data mutations with cache invalidation
   - Automatic cache management
   - Query key organization for invalidation

</details>

**Example Flow**:
```
User clicks "Add Employee" → Action Handler wraps addUser() → 
Server Action validates & inserts → Query cache invalidated → 
Component re-renders with new data → User sees toast notification
```

### Folder Structure & Documentation

```
workhero-barangay-kusina/
│
├── 📁 src/
│   │
│   ├── 📁 actions/                 # 🔷 Server Actions (Direct Supabase)
│   │   ├── auth.ts                 # Authentication & authorization logic
│   │   ├── hr.ts                   # HR-specific operations
│   │   ├── employee/
│   │   │   ├── attendance.ts       # Employee attendance logging
│   │   │   ├── badges.ts           # Badge interactions
│   │   │   ├── notifications.ts    # Notification fetching
│   │   │   ├── redemptions.ts      # Reward redemptions
│   │   │   ├── stats.ts            # Gamification stats
│   │   │   └── tasks.ts            # Task operations
│   │   ├── employees/              # Bulk employee operations
│   │   ├── hr/                     # HR-specific actions
│   │   ├── manager/                # Manager-specific actions
│   │   ├── shared/                 # Shared actions across roles
│   │   └── superadmin/             # Superadmin operations (user mgmt)
│   │
│   ├── 📁 action-handlers/         # 🔷 Client-side Action Wrappers
│   │   ├── profile.ts              # Profile mutation handlers
│   │   ├── sidebar.ts              # Sidebar data handlers
│   │   ├── employee/
│   │   │   ├── attendance.ts       # Attendance handlers with toast
│   │   │   ├── badges.ts           # Badge action handlers
│   │   │   ├── notifications.ts    # Notification handlers
│   │   │   ├── redemptions.ts      # Redemption handlers
│   │   │   ├── stats.ts            # Stats handlers
│   │   │   └── tasks.ts            # Task handlers
│   │   ├── hr/                     # HR handlers
│   │   ├── manager/                # Manager handlers
│   │   ├── shared/                 # Shared handlers
│   │   └── superadmin/             # Superadmin handlers
│   │
│   ├── 📁 app/                     # 🔷 Next.js App Router
│   │   ├── layout.tsx              # Root layout (providers, global setup)
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Global Tailwind styles
│   │   ├── error.tsx               # Global error boundary
│   │   ├── not-found.tsx           # 404 page
│   │   ├── admin/                  # Superadmin routes
│   │   │   └── manage/             # User management dashboard
│   │   ├── auth/                   # Authentication routes
│   │   │   └── login/              # Login page
│   │   ├── employee/               # Employee routes
│   │   │   ├── dashboard/          # Employee dashboard
│   │   │   ├── tasks/              # Task listing and details
│   │   │   ├── badges/             # Badge showcase
│   │   │   └── ...other routes
│   │   ├── hr/                     # HR routes
│   │   │   ├── dashboard/          # HR analytics dashboard
│   │   │   └── ...hr-specific routes
│   │   ├── manager/                # Manager routes
│   │   │   ├── dashboard/          # Manager dashboard
│   │   │   ├── assign-tasks/       # Task assignment
│   │   │   └── ...manager routes
│   │   ├── profile/                # Shared profile routes
│   │   ├── error/                  # Error pages by code
│   │   └── [role]/dashboard/       # Dynamic role-based dashboards
│   │
│   ├── 📁 components/              # 🔷 React Components (Role-Organized)
│   │   ├── ui/                     # shadcn/ui base components
│   │   │   ├── button.tsx          # Button component
│   │   │   ├── dialog.tsx          # Modal/Dialog component
│   │   │   ├── card.tsx            # Card component
│   │   │   ├── badge.tsx           # Badge display component
│   │   │   └── ...other Radix/shadcn components
│   │   ├── admin/                  # Superadmin-specific components
│   │   │   ├── user-management/
│   │   │   ├── modals/
│   │   │   └── ...admin components
│   │   ├── employee/               # Employee-specific components
│   │   │   ├── dashboard/
│   │   │   ├── task-card/
│   │   │   ├── achievements/
│   │   │   └── ...employee components
│   │   ├── manager/                # Manager-specific components
│   │   │   ├── assignment-board/
│   │   │   ├── verification/
│   │   │   └── ...manager components
│   │   ├── hr/                     # HR-specific components
│   │   │   ├── analytics/
│   │   │   └── ...hr components
│   │   ├── shared/                 # Shared across roles
│   │   │   ├── sidebar/            # Navigation sidebar
│   │   │   ├── header/             # Top navigation
│   │   │   └── ...shared components
│   │   ├── auth/                   # Auth-related components
│   │   ├── notifications/          # Notifications system
│   │   ├── profile/                # Profile components
│   │   └── login/                  # Login components
│   │
│   ├── 📁 hooks/                   # 🔷 Custom React Hooks
│   │   ├── use-toast.ts            # Toast notifications hook
│   │   ├── useAntiSpam.ts          # Anti-spam logic
│   │   ├── useDebounce.ts          # Debounced values (300ms default)
│   │   ├── useMercadoPageData.ts   # Reward marketplace data
│   │   ├── useProfileImage.ts      # Profile image handling
│   │   ├── useRealtimeNotifications.ts  # Supabase real-time
│   │   ├── useSidebarContentArea.ts    # Sidebar state
│   │   └── tanstack/               # React Query hooks
│   │       ├── queries/            # Data fetching (useQuery)
│   │       │   ├── useUserQuery.ts
│   │       │   ├── useTasksQuery.ts
│   │       │   ├── useBadgesQuery.ts
│   │       │   └── ...other queries
│   │       └── mutations/           # Data mutations (useMutation)
│   │           ├── useAddUserMutation.ts
│   │           ├── useUpdateTaskMutation.ts
│   │           └── ...other mutations
│   │
│   ├── 📁 lib/                     # 🔷 Shared Utilities & Config
│   │   ├── auth-context.tsx        # Auth context provider & hooks
│   │   ├── utils.ts                # Utility helpers (cn, classmerge)
│   │   ├── format.ts               # Formatting utilities
│   │   ├── leaderboard-utils.ts    # Leaderboard calculations
│   │   ├── notifications.ts        # Notification helpers
│   │   ├── attendance-config.ts    # Attendance settings
│   │   ├── supabase/               # Supabase client configuration
│   │   │   ├── server.ts           # Server-side client (with cookies())
│   │   │   ├── client.ts           # Client-side client (browser)
│   │   │   └── admin.ts            # Admin client (service role)
│   │   ├── providers/              # React context providers
│   │   │   ├── query-provider.tsx  # TanStack Query provider
│   │   │   └── ...other providers
│   │   ├── types/                  # TypeScript type utilities
│   │   ├── utils/                  # Helper functions
│   │   │   └── safe-action.ts      # ServerActionResponse wrapper
│   │   └── constants.ts            # App constants
│   │
│   ├── 📁 types/                   # 🔷 TypeScript Type Definitions
│   │   ├── index.ts                # Main types (User, EmployeeType)
│   │   ├── notification.ts         # Notification types
│   │   ├── profile-image.ts        # Profile image types
│   │   ├── attendance.ts           # Attendance-related types
│   │   ├── admin/                  # Admin-specific types
│   │   ├── employee/               # Employee-specific types
│   │   ├── hr/                     # HR-specific types
│   │   ├── manager/                # Manager-specific types
│   │   └── shared/                 # Shared types
│   │
│   ├── 📁 zod/                     # 🔷 Validation Schemas (Zod)
│   │   └── schemas/                # Schema definitions
│   │       ├── auth.ts             # Auth validation schemas
│   │       ├── user.ts             # User input validation
│   │       ├── badge.ts            # Badge validation
│   │       ├── search.ts           # Search filter validation
│   │       ├── task.ts             # Task validation
│   │       ├── reward.ts           # Reward validation
│   │       └── index.ts            # Export all schemas
│   │
│   ├── 📁 store/                   # 🔷 Zustand State Management
│   │   ├── navigationStore.ts      # Navigation UI state
│   │   ├── taskStore.ts            # Task UI state
│   │   ├── managerAssignmentStore.ts  # Manager assignment state
│   │   └── attendanceTestStore.ts  # Attendance UI state
│   │
│   ├── 📁 utils/                   # 🔷 Utility Functions
│   │   ├── date-utils.ts           # Date formatting & calculations
│   │   └── ...other utilities
│   │
│   ├── 📁 mock-data/               # 🔷 Mock Data for Development
│   │   └── employees.ts            # Sample employee data
│   │
│   └── 📁 test/                    # 🔷 Test Utilities
│       └── ...test helpers
│
├── 📁 supabase/                    # 🔷 Supabase Configuration
│   ├── config.toml                 # Supabase local setup config
│   ├── migrations/                 # Database migrations
│   │   └── 20260305162622_remote_baseline_updated.sql  # Initial schema
│   ├── functions/                  # Edge Functions (Deno)
│   │   └── evaluate-badges/        # Badge evaluation logic serverless
│   └── seeds/                      # Database seed data (if exists)
│
├── 📁 __tests__/                   # 🔷 Jest Test Files
│   ├── superadmin.test.ts          # Superadmin functionality tests
│   ├── badge-editor.test.ts        # Badge creation/editing tests
│   ├── badge-assignment.test.ts    # Badge assignment workflow tests
│   ├── task-verification.test.ts   # Task verification tests
│   ├── utils/
│   │   └── seedTasks.ts            # Test data seeding utility
│   └── ...other test files
│
├── 📁 cypress/                     # 🔷 Cypress E2E Tests
│   ├── e2e/                        # End-to-end test scenarios
│   ├── fixtures/                   # Test data fixtures
│   ├── support/
│   │   ├── commands.ts             # Custom Cypress commands
│   │   └── e2e.ts                  # E2E support setup
│   ├── tsconfig.json               # TypeScript config for tests
│   └── cypress.config.ts           # Cypress configuration
│
├── 📁 public/                      # 🔷 Static Assets
│   ├── assets/                     # Images, icons, etc.
│   └── mercado/                    # Reward marketplace assets
│
├── 📁 .github/                     # 🔷 GitHub Configuration
│   ├── copilot-instructions.md     # AI agent instructions
│   └── ...GitHub workflows
│
├── 📄 next.config.ts               # Next.js configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 tsconfig.test.json           # TypeScript config for tests
├── 📄 jest.config.ts               # Jest configuration
├── 📄 jest.setup.ts                # Jest global setup
├── 📄 cypress.config.ts            # Cypress configuration
├── 📄 package.json                 # Dependencies & scripts
├── 📄 tailwind.config.mjs           # Tailwind CSS configuration
├── 📄 postcss.config.mjs            # PostCSS configuration
├── 📄 eslint.config.mjs             # ESLint configuration
├── 📄 .env.local                   # Environment variables (local)
├── 📄 .env.test                    # Environment variables (test)
├── 📄 .env.production              # Environment variables (production)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 components.json              # shadcn/ui configuration
├── 📄 DATABASE_DUMP.sql            # Database schema export
└── 📄 README.md                    # This file

```

### Architecture Patterns

#### 1. Server Actions Pattern (3-Layer)

All data mutations follow this consistent pattern:

**Layer 1: Server Action** (`src/actions/superadmin/users.ts`)
```typescript
'use server';

export async function addUser(input: AddUserInput): Promise<ServerActionResponse<User>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .insert([input])
      .select();

    if (error) return { error: error.message };
    return { error: null, data: data[0] };
  } catch (err) {
    return { error: 'Failed to add user' };
  }
}
```

**Layer 2: Action Handler** (`src/action-handlers/superadmin/users.ts`)
```typescript
export async function handleAddUser(input: AddUserInput) {
  const result = await safeAction(() => addUser(input));
  
  if (!result.success) {
    toast.error(result.error);
    return null;
  }

  toast.success('User added successfully');
  return result.data;
}
```

**Layer 3: React Hook** (`src/hooks/tanstack/mutations/useAddUserMutation.ts`)
```typescript
export function useAddUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input) => handleAddUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

#### 2. Role-Based Authentication

Users have four distinct roles with different permissions:

| Role | Dashboard | Permissions |
|------|-----------|-------------|
| **superadmin** | `/admin/manage` | Add/edit/delete users, view all data |
| **manager** | `/manager/dashboard` | Assign tasks, verify task completion, view team |
| **hr** | `/hr/dashboard` | Attendance adjustment, generate reports, manage rewards |
| **regular/employee** | `/employee/dashboard` | View tasks, submit task updates, redeem rewards |

**Auth Helpers** (`src/actions/auth.ts`):
- `getUserRole()` - Get current user's role
- `protectAdminRoute()` - Verify superadmin access
- `redirectToCorrectDashboardServer()` - Redirect based on role after login

#### 3. Supabase Client Strategy

**Critical Rule**: Use the correct client for each context

```typescript
// ✅ Server Components / Server Actions
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient(); // async, uses cookies()

// ✅ Client Components (hooks, callbacks)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient(); // sync, browser-only

// ❌ NEVER leave admin client unprotected
import { supabaseAdmin } from '@/lib/supabase/admin';
// Service role - use only in protected server code!
```

#### 4. Query Key Organization (TanStack Query)

```typescript
// Define query keys for consistent invalidation
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => 
    [...userKeys.lists(), params] as const,
};

// Invalidation after mutations
queryClient.invalidateQueries({ 
  queryKey: userKeys.lists() 
// This invalidates all user list queries at once
});
```

#### 5. Zustand Workflow

- Global/optimistic UI state lives in `src/store/*` (navigation, tasks, assignments, attendance, etc.).
- Mutation flow: **Server Action → Action Handler (toasts/shape) → TanStack Mutation (cache) → Zustand optimistic helpers**.
- Stores provide prepend/replace/delete helpers used in mutations before invalidating React Query caches.
- Keep secrets/admin logic in server actions; Zustand is for client experience only.

#### 6. Type Safety with Zod

```typescript
// Define schema in zod/schemas/user.ts
export const addUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: EmployeeType,
});

// Infer type
export type AddUserInput = z.infer<typeof addUserSchema>;

// Use in forms with React Hook Form
const form = useForm<AddUserInput>({
  resolver: zodResolver(addUserSchema),
});
```

</details>

<details>
<summary><strong>🔧 Quirks & Special Configurations</strong></summary>

### Email (Brevo SMTP)

- Set SMTP vars in `.env.local`: `SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_KEY`, `SMTP_FROM="Compushure <tonilegayada@gmail.com>"`.
- If your network uses TLS inspection/self-signed certs, set `SMTP_ALLOW_SELF_SIGNED=true` or provide the proxy CA via `NODE_EXTRA_CA_CERTS=/path/to/ca.crt`.
- Verify connectivity without sending a real message: `npm run smtp:verify` (runs Nodemailer `transporter.verify()` with `.env.local`).

### Database Migrations

Supabase uses migration files for schema management in `supabase/migrations/`:

```bash
# Create a new migration
supabase migration new add_column_to_users

# Apply migrations to local database
supabase db push

# Pull latest migrations from remote
supabase db pull
```

**Current Migrations**:
- `20260305162622_remote_baseline_updated.sql` - Initial schema setup

The baseline includes tables for: users, tasks, badges, achievements, attendance, rewards, notifications, etc.

### Supabase Edge Functions

Edge Functions in `supabase/functions/` run Deno (TypeScript runtime):

```bash
# Create a new edge function
supabase functions new evaluate-badges

# Deploy functions
supabase functions deploy evaluate-badges

# Set environment secrets
supabase secrets set --env-file ./supabase/.env.local
```

**Example Edge Function** (`evaluate-badges/`):
- Async badge evaluation logic
- Triggered on task completion or schedule
- Updates user gamification stats

### Testing Configuration

#### Jest Setup

- **Config**: `jest.config.ts`
- **Environment**: Node.js
- **Transform**: ts-jest for TypeScript
- **Module Paths**: Aliases configured (@/*)
- **Global Setup**: `jest.setup.ts`

Run with: `npm test` (runs in `NODE_ENV=test`)

#### Cypress Setup

- **Config**: `cypress.config.ts`
- **Base URL**: Configurable in `cypress.config.ts`
- **Support**: `cypress/support/commands.ts` for custom commands
- **Fixtures**: `cypress/fixtures/` for test data

Open Cypress GUI: `npm run cypress:open`

</details>

<details>
<summary><strong>🎨 Styling & UI</strong></summary>

### Tailwind CSS 4 with CSS Variables

Global CSS variables defined in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.6%;
    /* ...more variables */
  }
}
```

Used in components:
```tsx
<div className="bg-background text-foreground">
  // Background and text colors automatically switch on theme change
</div>
```

### shadcn/ui Component Usage

Install components via CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
```

Components auto-install to `src/components/ui/` and use path aliases.

</details>

<details>
<summary><strong>📥 Path Aliases</strong></summary>

TypeScript path aliases defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { api } from '@/lib/api';
```

</details>

<details>
<summary><strong>📈 Deployment</strong></summary>

### Production Build

```bash
npm run build
npm run start
```

Server runs on default Next.js port (3000 or configurable).

### Environment for Production

Create `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=prod_key
SUPABASE_URL=prod_url
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Deploy on Vercel

Easiest deployment method:

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Vercel auto-builds and deploys on push
4. Set environment variables in Vercel dashboard

</details>

<details>
<summary><strong>🔄 Pull Request Process</strong></summary>

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and follow code style:
   ```bash
   npm run format
   npm run lint -- --fix
   ```

3. **Write/update tests**:
   - Unit tests in `__tests__/`
   - E2E tests in `cypress/e2e/`

4. **Run all checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run cypress:open
   ```

5. **Commit with pre-commit hooks** (Husky + lint-staged):
   ```bash
   git add .
   git commit -m "feat: add new badge system"
   # Hooks auto-run: eslint --fix, prettier --write
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **PR Template**: Fill out `.github/pull_request_template.md` with:
   - Description of changes
   - Related issues
   - Screenshots (if UI changes)
   - Testing steps

</details>

<details>
<summary><strong>⚠️ Common Pitfalls</strong></summary>

| ❌ Don't | ✅ Do |
|---------|-------|
| Use `createClient()` (sync) in server code | Use `createClient()` (async) from `@/lib/supabase/server` |
| Forget `'use server'` directive in actions | Add `'use server'` at top of server action files |
| Expose `SUPABASE_SERVICE_ROLE_KEY` to client | Keep service role key server-side only |
| Call actions directly in UI code | Wrap actions in handlers with `safeAction()` |
| Import from `sonner` without checking setup | Verify `<Toaster />` in root layout |
| Mutate query cache directly | Use `useMutation()` with `onSuccess` callback |
| Skip TypeScript validation before PR | Run `npm run typecheck` first |

</details>

<details>
<summary><strong>📚 Key Technologies Deep Dive</strong></summary>

### Next.js 16 Features Used

- **App Router**: File-based routing with dynamic segments
- **Server Components**: Default; components render on server
- **Server Actions**: Mutations via functions with `'use server'`
- **Image Optimization**: Next.js Image component with Supabase remote patterns
- **Font Optimization**: Google Fonts via `next/font`
- **Turbopack**: Fast bundling in dev mode

### Supabase Real-Time

Real-time subscriptions in `useRealtimeNotifications` hook:

```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'notifications' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

### TanStack Query (React Query) v5

- **Query Cache**: Automatic deduplication and background refetching
- **Mutation Options**: `onSuccess`, `onError`, `onSettled` callbacks
- **Devtools**: React Query DevTools in development
- **Stale Time**: Configurable staleness for each query
- **Invalidation**: Selective query invalidation after mutations

</details>

<details>
<summary><strong>📖 Documentation & Resources</strong></summary>

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

</details>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow the Pull Request Process above and ensure all tests pass before submitting.

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for seamless employee management and gamification**
