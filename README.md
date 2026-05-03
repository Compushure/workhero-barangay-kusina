<img width="1906" height="605" alt="image" src="https://github.com/user-attachments/assets/86d39c0a-c1ba-4701-af36-e94de4cdb58c" />


# WorkHero Barangay Kusina

Test Coverage Summaries:
- [__tests___/unit/summary_of_unit_test_coverage.md](__tests___/unit/summary_of_unit_test_coverage.md)
- [__tests___/integration/summary_of_integration_test_coverage.md](__tests___/integration/summary_of_integration_test_coverage.md)
- [cypress/summary_of_e2e_test.md](cypress/summary_of_e2e_test.md)

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-149ECA?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State-7A5432)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-E2E-69D3A7?logo=cypress&logoColor=white)




Role-based employee operations and gamification platform built with Next.js, Supabase, TypeScript, TanStack Query, Zustand, and Tailwind CSS.

This repository powers a multi-role internal portal for:

- superadmin user management
- manager task assignment, verification, badge editing, and badge awarding
- HR reward inventory, redemption workflows, and leaderboard generation
- employee attendance, tasks, notifications, rewards, rankings, and profile management

## Contents

<details open>
<summary><strong>Jump Links</strong></summary>

- [Project Summary](#project-summary)
- [Core Features](#core-features)
- [Role Surface Map](#role-surface-map)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Request Flow Patterns](#request-flow-patterns)
- [Repository Structure](#repository-structure)
- [App Route Map](#app-route-map)
- [Domain Model and Supabase Objects](#domain-model-and-supabase-objects)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Testing Strategy](#testing-strategy)
- [Feature Module Guide](#feature-module-guide)
- [Storage and Media Conventions](#storage-and-media-conventions)
- [Important Implementation Notes](#important-implementation-notes)
- [Known Transitional Areas](#known-transitional-areas)
- [Deployment Notes](#deployment-notes)
- [Contribution Notes](#contribution-notes)
- [License](#license)

</details>

## Project Summary

<details open>
<summary><strong>View Section</strong></summary>

WorkHero Barangay Kusina is structured around role-specific operational flows rather than one generic dashboard. The app uses the Next.js App Router, server-side Supabase access, typed server actions, React Query caching, and a small set of Zustand stores for optimistic UI state.

The codebase is not a thin CRUD shell. It includes actual operational logic for:

- session-aware role routing
- welcome-email onboarding with first-login magic links
- attendance time windows and auto-absent behavior
- task lifecycle progression from assigned -> in review -> approved/rejected
- badge requirements and manual badge awards
- reward redemption inventory logic
- generated leaderboard periods with visibility controls
- realtime employee notifications through Supabase channels

</details>

## Core Features

<details>
<summary><strong>View Section</strong></summary>

- Role-based access control for `superadmin`, `manager`, `hr`, and `regular`
- Superadmin user CRUD with search, filters, pagination, profile photos, and welcome email delivery
- Manager task assignment with grouped task cards, per-employee views, optimistic updates, and notification inserts
- Manager verification workflow for reviewing submitted employee work
- Manager badge editor with badge conditions and image upload
- Manager badge assignment for manual badge awards
- HR Mercado inventory management with interval-based availability windows
- HR reward request approval and decline workflow
- HR leaderboard generation, visibility toggling, and top-10 notification fanout
- Employee attendance actions for time in, time out, break start, and break end
- Employee task board with review, redo, claim, and serving flow
- Employee profile and profile media management
- Realtime notifications using Supabase `postgres_changes`
- Jest unit/integration coverage plus Cypress coverage for superadmin and manager flows

</details>

## Role Surface Map

<details>
<summary><strong>View Section</strong></summary>

| Role         | Main Routes                                                                                                                            | Main Responsibilities                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `superadmin` | `/admin/manage`                                                                                                                        | manage users, update roles and employment data, upload/remove profile photos, send onboarding emails |
| `manager`    | `/manager/task-assignment`, `/manager/task-verification`, `/manager/task-editor`, `/manager/badge-assignment`, `/manager/badge-editor` | assign and update tasks, review work, manage KPI categories, manage badges                           |
| `hr`         | `/hr/reward-requests`, `/hr/mercado`, `/hr/leaderboard`                                                                                | manage reward inventory, process redemption requests, generate and publish leaderboards              |
| `regular`    | `/employee/dashboard`, `/employee/attendance`, `/employee/tasks`, `/employee/mercado`, `/employee/leaderboard`                         | track attendance, complete tasks, claim rewards, view rankings, manage profile                       |

</details>

## Tech Stack

<details>
<summary><strong>View Section</strong></summary>

| Area                   | Tools in use                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| Framework              | Next.js `16.2.1`, React `19.2.4`, App Router                       |
| Language               | TypeScript with strict mode                                        |
| Backend platform       | Supabase Auth, Postgres, Storage, Realtime, Edge Functions         |
| Client data layer      | TanStack Query v5                                                  |
| Client state           | Zustand                                                            |
| Validation             | Zod                                                                |
| Forms                  | React Hook Form                                                    |
| Styling                | Tailwind CSS v4, custom global CSS, shadcn/ui and Radix primitives |
| Notifications          | Sonner toasts plus persisted Supabase `Notification` rows          |
| Email                  | Nodemailer SMTP flow using Brevo-compatible credentials            |
| Unit/integration tests | Jest + ts-jest                                                     |
| E2E tests              | Cypress                                                            |
| Tooling                | ESLint, Prettier, Husky, lint-staged                               |

</details>

## Architecture Overview

<details>
<summary><strong>View Section</strong></summary>

At a high level, the repository is organized by product domain and then by execution layer.

```text
UI components and route shells
  -> TanStack query/mutation hooks
  -> action handlers
  -> server actions
  -> Supabase tables/views/RPCs/storage
```

The codebase also contains one important variation:

```text
superadmin UI
  -> action handlers
  -> server actions
  -> internal route handlers under src/app/admin/tools/*
  -> Supabase admin/public operations
```

That means the repo uses both of these server-side styles today:

- direct server actions
- server actions that still call internal route handlers for some superadmin work

</details>

## Request Flow Patterns

<details>
<summary><strong>View Section</strong></summary>

### 1. Standard flow used across most domains

This is the dominant pattern in `manager`, `hr`, `employee`, and shared profile/auth work.

```text
component
  -> action-handler
  -> safeAction(...)
  -> server action
  -> Supabase
```

Responsibilities by layer:

| Layer                | Folder                          | Responsibility                                                                        |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| UI                   | `src/components/*`, `src/app/*` | rendering, form interaction, route composition                                        |
| Query/mutation hooks | `src/hooks/tanstack/*`          | cache keys, invalidation, background fetching, optimistic flow coordination           |
| Action handlers      | `src/action-handlers/*`         | user-facing error handling, toast messages, shaping return values                     |
| Server actions       | `src/actions/*`                 | auth checks, Supabase access, domain logic, validation                                |
| Utilities            | `src/lib/*`, `src/utils/*`      | cross-cutting helpers such as notifications, date handling, role routing, safe-action |

### 2. Superadmin user management flow

Superadmin management is slightly different and still routes some work through internal route handlers:

```text
component
  -> useAddUser / useEditUser / useDeleteUser
  -> src/action-handlers/superadmin/users.ts
  -> src/actions/superadmin/users.ts
  -> src/app/admin/tools/*/route.ts
  -> Supabase admin client and public tables
```

This is important when tracing bugs in:

- user creation
- password changes
- user deletion
- user filtering
- welcome email and magic-link generation

### 3. Client state strategy

This repo uses both TanStack Query and Zustand, but for different jobs:

- TanStack Query is the source of truth for server-backed cached data
- Zustand is used for local UI state and optimistic updates

Current optimistic stores include:

- `src/store/adminUserStore.ts`
- `src/store/managerAssignmentStore.ts`
- `src/store/managerBadgeAssignmentStore.ts`
- `src/store/managerBadgeEditorStore.ts`
- `src/store/hrRedemptionRequestStore.ts`
- `src/store/employee/employeeTasksStore.ts`

### 4. Supabase client selection

The app intentionally uses different Supabase clients by runtime:

| Client                  | File                                            | Use case                                                  |
| ----------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| server client           | `src/lib/supabase/server.ts`                    | server components and server actions with cookies/session |
| browser client          | `src/lib/supabase/client.ts`                    | client components and realtime subscriptions              |
| admin client            | `src/lib/supabase/admin.ts`                     | privileged server-only operations using service role      |
| request/session refresh | `src/lib/supabase/proxy.ts` and root `proxy.ts` | session refresh and unauthenticated redirects             |

</details>

## Repository Structure

<details>
<summary><strong>View Section</strong></summary>

The repository structure is documented visually below so the top-level nesting and feature boundaries are easy to scan.

Top-level layout:

```text
.
|-- src/
|   |-- app/                  # App Router routes, layouts, route handlers, error/loading boundaries
|   |-- actions/              # Server actions grouped by domain
|   |-- action-handlers/      # Client-side wrappers around server actions
|   |-- components/           # Feature and shared UI
|   |-- hooks/                # Reusable hooks, including TanStack hooks
|   |-- lib/                  # Supabase helpers, providers, mail, shared utilities
|   |-- store/                # Zustand stores for optimistic and UI state
|   |-- types/                # Domain types
|   |-- utils/                # Shared utility functions
|   `-- zod/                  # Validation schemas
|-- supabase/
|   |-- migrations/           # database migrations
|   |-- functions/            # edge function code
|   `-- test/                 # SQL schema/roles/data for test environments
|-- __tests___/               # Jest tests and mock data
|-- cypress/                  # Cypress tests, tasks, fixtures, support
|-- scripts/                  # small utility scripts
|-- public/                   # static assets
|-- next.config.ts
|-- proxy.ts
`-- README.md
```

Detailed source nesting:

```text
src/
|-- app/
|   |-- admin/
|   |-- auth/
|   |-- employee/
|   |-- hr/
|   |-- manager/
|   |-- profile/[userid]/
|   |-- error.tsx
|   |-- error/page.tsx
|   |-- not-found.tsx
|   |-- layout.tsx
|   `-- page.tsx
|-- actions/
|   |-- employee/
|   |-- employees/
|   |-- hr/
|   |-- manager/
|   |-- shared/
|   `-- superadmin/
|-- action-handlers/
|   |-- employee/
|   |-- hr/
|   |-- manager/
|   |-- shared/
|   `-- superadmin/
|-- hooks/
|   |-- tanstack/
|   |   |-- mutations/
|   |   `-- queries/
|   |-- hr/
|   `-- shared utility hooks
|-- components/
|   |-- admin/
|   |-- attendance/
|   |-- auth/
|   |-- employee/
|   |-- error/
|   |-- homepage/
|   |-- hr/
|   |-- manager/
|   |-- notifications/
|   |-- profile/
|   |-- shared/
|   |-- sidebar/
|   |-- smtp/
|   `-- ui/
|-- lib/
|   |-- providers/
|   |-- smtp/
|   |-- supabase/
|   |-- users/
|   `-- utils/
|-- store/
|   |-- employee/
|   `-- root stores
|-- types/
|   |-- admin/
|   |-- employee/
|   |-- hr/
|   |-- manager/
|   `-- shared/
`-- zod/schemas/
```

</details>

## App Route Map

<details>
<summary><strong>View Section</strong></summary>

### Public and auth routes

| Route              | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `/`                | marketing/home landing page                |
| `/auth/login`      | employee login page                        |
| `/auth/adminlogin` | superadmin login page                      |
| `/auth/confirm`    | Supabase OTP/magic-link confirmation route |
| `/auth/welcome`    | welcome/registration placeholder page      |
| `/error`           | query-string-driven error page             |

### Superadmin routes

| Route                   | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `/admin/manage`         | user management UI                            |
| `/admin/tools/adduser`  | internal route handler used by server actions |
| `/admin/tools/changepw` | internal route handler used by server actions |
| `/admin/tools/deluser`  | internal route handler used by server actions |
| `/admin/tools/filter`   | internal route handler used by server actions |

### Manager routes

| Route                        | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `/manager/dashboard`         | lightweight manager landing page         |
| `/manager/task-assignment`   | assign/update/unassign tasks             |
| `/manager/task-verification` | approve or reject submitted tasks        |
| `/manager/task-editor`       | manage KPI categories                    |
| `/manager/badge-assignment`  | manually award badges                    |
| `/manager/badge-editor`      | create/edit/delete badges and conditions |

### HR routes

| Route                 | Purpose                       |
| --------------------- | ----------------------------- |
| `/hr/reward-requests` | review redemption requests    |
| `/hr/mercado`         | manage reward inventory       |
| `/hr/leaderboard`     | generate and publish rankings |

### Employee routes

| Route                   | Purpose                          |
| ----------------------- | -------------------------------- |
| `/employee`             | employee surface entry point     |
| `/employee/dashboard`   | gamified employee landing screen |
| `/employee/attendance`  | attendance actions and timeline  |
| `/employee/tasks`       | task board                       |
| `/employee/mercado`     | reward marketplace               |
| `/employee/leaderboard` | visible leaderboard view         |

### Shared authenticated route

| Route               | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `/profile/[userid]` | authenticated user profile view restricted to the session user |

</details>

## Domain Model and Supabase Objects

<details>
<summary><strong>View Section</strong></summary>

### Main tables present in the Supabase test schema

The SQL under `supabase/test/schema.sql` and the baseline migration shows these core tables:

- `User`
- `Role`
- `AttendanceLog`
- `KPICategory`
- `KPITask`
- `Badges`
- `BadgeRequirements`
- `UserBadges`
- `Reward`
- `RewardRequest`
- `Notification`
- `Level`
- `Dishes`
- `RankingPeriod`
- `RankingEntry`

### Important views and RPCs referenced by the application

The app relies on several database-level helpers and views, including:

- `user_attributes`
- `task_info_view`
- `badge_conditions_view`
- `user_collected_badges_view`
- `ranking_leaderboard_view`
- `rpc_update_user_name_and_assign_role`
- `get_leaderboard_as_of`
- `evaluate_badges` RPC, also exposed through an edge function

### Domain relationships in practice

| Domain          | Key relationships used by the app                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| users and roles | `User.role_id -> Role.id`, auth claims also carry `app_metadata.user_role`                           |
| tasking         | `KPICategory` defines the task template, `KPITask` stores assignment instances                       |
| badges          | `Badges` is the main badge record, `BadgeRequirements` stores conditions, `UserBadges` stores awards |
| rewards         | `Reward` is an inventory item, `RewardRequest` stores redemption attempts and approvals              |
| rankings        | `RankingPeriod` stores generated periods, `RankingEntry` stores per-user ranked results              |
| notifications   | `Notification` rows are inserted server-side and consumed through queries plus realtime              |

</details>

## Environment Variables

<details>
<summary><strong>View Section</strong></summary>

Variables referenced directly in code:

| Variable                               | Required                    | Used for                                                       |
| -------------------------------------- | --------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | yes                         | browser/server Supabase URL, image remote pattern construction |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes                         | browser and server session-based Supabase access               |
| `SUPABASE_URL`                         | yes for admin flows         | service-role client base URL                                   |
| `SUPABASE_SERVICE_ROLE_KEY`            | yes for admin flows         | privileged server-only operations                              |
| `NEXT_PUBLIC_BASE_URL`                 | strongly recommended        | internal superadmin route calls and first-login magic links    |
| `SMTP_HOST`                            | required for welcome emails | SMTP hostname                                                  |
| `SMTP_PORT`                            | required for welcome emails | SMTP port                                                      |
| `SMTP_USER`                            | required for welcome emails | SMTP username                                                  |
| `SMTP_KEY`                             | required for welcome emails | SMTP password/key                                              |
| `SMTP_FROM`                            | optional                    | sender identity                                                |
| `SMTP_ALLOW_SELF_SIGNED`               | optional                    | allow self-signed TLS certificates for SMTP transport          |
| `SUPPORT_EMAIL`                        | optional                    | contact address inserted into onboarding emails                |

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_BASE_URL=http://localhost:3008

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_KEY=your_smtp_key
SMTP_FROM="WorkHero <noreply@example.com>"
SMTP_ALLOW_SELF_SIGNED=false
SUPPORT_EMAIL=support@example.com
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.
- `NEXT_PUBLIC_BASE_URL` matters in this repo because some server actions still call internal route handlers and because welcome emails generate absolute links.
- SMTP is optional only if you are not exercising superadmin onboarding email flows.

</details>

## Getting Started

<details>
<summary><strong>View Section</strong></summary>

### Prerequisites

- Node.js 20 LTS recommended
- npm
- a Supabase project with matching schema/storage/RPCs
- optional: Supabase CLI if you want to work with migrations or edge functions locally

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:3008
```

### Type-check, lint, and format

```bash
npm run typecheck
npm run lint
npm run format
```

### Production build

```bash
npm run build
npm run start
```

</details>

## Available Scripts

<details>
<summary><strong>View Section</strong></summary>

From `package.json`:

| Script                     | Command                                              | Purpose                    |
| -------------------------- | ---------------------------------------------------- | -------------------------- |
| `npm run dev`              | `next dev -p 3008`                                   | start local dev server     |
| `npm test`                 | `cross-env NODE_ENV=test jest --runInBand --verbose` | run all Jest tests         |
| `npm run test:unit`        | `... __tests___/unit`                                | run unit tests only        |
| `npm run test:integration` | `... __tests___/integration`                         | run integration tests only |
| `npm run test:watch`       | `jest --watch --verbose`                             | watch mode                 |
| `npm run build`            | `cross-env NODE_ENV=production next build`           | production build           |
| `npm run start`            | `next start`                                         | start built app            |
| `npm run lint`             | `eslint .`                                           | lint                       |
| `npm run format`           | `prettier --write .`                                 | format                     |
| `npm run format:check`     | `prettier --check .`                                 | format check               |
| `npm run typecheck`        | `tsc --noEmit`                                       | TypeScript verification    |
| `npm run prepare`          | `husky`                                              | install hooks              |
| `npm run smtp:verify`      | `node scripts/smtp-verify.js`                        | verify SMTP transport      |
| `npm run cypress:open`     | `cross-env NODE_ENV=test cypress open`               | launch Cypress UI          |

There is currently no `cypress:run` script in `package.json`. For headless Cypress runs, use:

```bash
npx cypress run
```

</details>

## Testing Strategy

<details>
<summary><strong>View Section</strong></summary>

### Jest

Jest is configured through:

- `jest.config.ts`
- `jest.setup.ts`
- `tsconfig.test.json`

Current characteristics:

- Node test environment
- `ts-jest` transform for `ts` and `tsx`
- `@/*` path alias mapping to `src/*`
- `.env.test` loading in setup
- `next/navigation` redirect mocked in tests

Current Jest folder layout:

```text
__tests___/
|-- unit/
|   |-- employee/
|   |-- hr/
|   |-- manager/
|   |-- shared/
|   `-- superadmin/
|-- integration/
|   |-- employee/
|   |-- hr/
|   |-- manager/
|   |-- shared/
|   `-- superadmin/
|-- mockData/
`-- utils/
```

Important note: the repository test folder is named `__tests___` with three trailing underscores, not the more common `__tests__`.

### Cypress

Cypress is configured in `cypress.config.ts` and currently includes:

- direct Supabase login tasks
- direct service-role test helpers for creating/deleting users and badges
- manager E2E specs
- superadmin E2E specs

Current E2E spec folders:

```text
cypress/e2e/
|-- manager/
`-- superadmin/
```

</details>

## Feature Module Guide

<details>
<summary><strong>View Section</strong></summary>

### Superadmin

Key files:

- `src/actions/superadmin/users.ts`
- `src/action-handlers/superadmin/users.ts`
- `src/hooks/tanstack/queries/userQueries.ts`
- `src/hooks/tanstack/mutations/userMutations.ts`
- `src/store/adminUserStore.ts`
- `src/app/admin/manage/page.tsx`

Highlights:

- paginated user search/filter/sort
- profile photo upload and delete
- first-login magic link creation
- welcome email delivery
- internal route-handler bridge for add/filter/delete/password flows

### Manager

Key domains:

- task assignment: `src/actions/manager/assignments.ts`, `src/actions/manager/assigned-tasks.ts`
- task verification: `src/actions/manager/verification.ts`
- task editor: `src/actions/manager/editor.ts`
- badge editor: `src/actions/manager/badges.ts`
- badge assignment: `src/actions/manager/badge-assignment.ts`

Highlights:

- grouped assigned-task views by task and by employee
- optimistic assignment editing through Zustand + TanStack Query
- verification approval/rejection flow
- badge condition authoring with task, user, and attendance requirement types
- manual badge awards with point updates and notifications

### HR

Key domains:

- rewards: `src/actions/hr/rewards.ts`
- redemptions: `src/actions/hr/redemptions.ts`
- leaderboard: `src/actions/hr/leaderboard.ts`

Highlights:

- Mercado inventory management
- interval-based reward availability windows
- redemption approval/decline workflow
- generated weekly/monthly/yearly ranking periods
- visibility toggles for employee-facing leaderboards
- top-10 notifications when a ranking becomes visible

### Employee

Key domains:

- attendance: `src/actions/employee/attendance.ts`
- tasks: `src/actions/employee/tasks.ts`
- stats: `src/actions/employee/stats.ts`
- redemptions: `src/actions/employee/redemptions.ts`
- notifications: `src/actions/employee/notifications.ts`
- badges: `src/actions/employee/badges.ts`

Highlights:

- attendance time windows using Manila timezone defaults
- task lifecycle with submission, review, claim, redo, and continuation
- XP and level progression
- reward claiming and Mercado browsing
- realtime notifications
- leaderboard viewing and profile surfaces

### Shared and cross-cutting modules

Important shared files:

- `src/actions/shared/auth.ts`
- `src/actions/shared/profile.ts`
- `src/actions/shared/sidebar.ts`
- `src/lib/utils/safe-action.ts`
- `src/lib/notifications.ts`
- `src/lib/smtp/welcome-email.ts`
- `src/lib/users/email-availability.ts`
- `src/hooks/useRealtimeNotifications.ts`

These modules cover:

- server-side route protection
- session-aware redirects
- profile management
- reusable server action wrapping
- notification inserts
- welcome-email templating
- duplicate-email detection across public user data and auth users

</details>

## Storage and Media Conventions

<details>
<summary><strong>View Section</strong></summary>

The code expects these Supabase storage buckets:

| Bucket       | Purpose                 | Example object path      |
| ------------ | ----------------------- | ------------------------ |
| `employees`  | user profile pictures   | `{userId}/profile.png`   |
| `badges`     | badge images            | `{badgeId}/badge.png`    |
| `reward`     | reward images           | `{rewardId}/profile.png` |
| `user-files` | uploaded user documents | `{userId}/{filename}`    |

Media-related conventions:

- image uploads are validated in code to `5MB` max in several places
- many public URLs add `?t=${Date.now()}` for cache-busting
- `next.config.ts` derives an image remote pattern from `NEXT_PUBLIC_SUPABASE_URL`

</details>

## Important Implementation Notes

<details>
<summary><strong>View Section</strong></summary>

### Authentication and route protection

- Server-side protection lives in `src/actions/shared/auth.ts`.
- Layouts for `admin`, `manager`, `hr`, and `employee` all protect routes on the server before rendering.
- `proxy.ts` refreshes Supabase session state and redirects unauthenticated traffic.

### Attendance logic

Attendance defaults live in `src/lib/attendance-config.ts`:

- time in: `07:00`
- late after: `07:30`
- time out: `17:30`
- overtime after: `17:30`
- auto timeout: `23:59`
- break duration: `01:00`
- timezone: `Asia/Manila`

Attendance actions handle:

- same-day log lookup
- auto-absent insertion when no time-in happens by close
- over-break detection
- auto-timeout/auto-absent behavior
- timeline generation for employee UI

### Notification strategy

- persisted notifications are inserted through `src/lib/notifications.ts`
- employee UI reads them through TanStack queries
- realtime toasts subscribe to `Notification` inserts with `useRealtimeNotifications`

### Welcome-email onboarding

When a superadmin creates a user:

1. the app validates email availability across both public and auth records
2. the auth user and public user row are created
3. a first-login magic link is generated
4. an SMTP welcome email is sent using `src/components/smtp/email.html`

### Leaderboard generation

HR leaderboard generation:

1. computes a completed period
2. calls the `get_leaderboard_as_of` RPC
3. persists `RankingPeriod` and `RankingEntry`
4. exposes results through `ranking_leaderboard_view`
5. optionally notifies visible top-10 users when the ranking is published

</details>

## Known Transitional Areas

<details>
<summary><strong>View Section</strong></summary>

These are worth knowing before refactoring:

- Superadmin server actions still call internal route handlers under `src/app/admin/tools/*`.
- `src/lib/auth-context.tsx` is a lightweight client auth wrapper, but server-side auth protection is the real access-control source.
- There are older compatibility-style files alongside more domain-scoped ones, for example `src/actions/hr.ts` vs `src/actions/hr/*` and `src/action-handlers/profile.ts` vs `src/action-handlers/shared/profile.ts`.
- The repository contains a few debug/test-only UI helpers under employee and attendance component trees.
- The root session redirect logic in `proxy.ts` and the server role redirect helpers should be treated carefully because they affect every authenticated route.

</details>

## Deployment Notes

<details>
<summary><strong>View Section</strong></summary>

### Next.js configuration

`next.config.ts` currently does a few important things:

- enables server action body size limit of `5mb`
- sets the Turbopack root
- configures remote image patterns from the Supabase host at runtime

### Session proxy

This repository uses `proxy.ts` rather than a traditional `middleware.ts` file. It:

- refreshes Supabase auth state on requests
- skips static assets and image optimization routes
- redirects unauthenticated requests away from protected pages

### Supabase edge function

The repo contains:

- `supabase/functions/evaluate-badges/index.ts`

This edge function calls the `evaluate_badges` RPC and is intended for scheduled or manual badge evaluation.

</details>

## Contribution Notes

<details>
<summary><strong>View Section</strong></summary>

When extending the codebase, these conventions match the current architecture best:

- put server-only domain logic in `src/actions/<domain>/`
- wrap server actions in `src/action-handlers/<domain>/` for toasts and client-safe return shaping
- expose React Query access from `src/hooks/tanstack/queries` and `src/hooks/tanstack/mutations`
- use Zod schemas from `src/zod/schemas` for user input validation
- keep service-role logic on the server only
- prefer the appropriate Supabase client for the runtime context
- use the existing query-key factories when invalidating data
- use existing Zustand optimistic helpers instead of ad hoc local cache mutations

Before opening a PR, the usual local checks are:

```bash
npm run typecheck
npm run lint
npm test
```

If your change touches SMTP onboarding, reward flows, or task assignment/verification, also test the relevant UI path locally because those flows span several layers.

</details>

## License

<details>
<summary><strong>View Section</strong></summary>

This project is licensed under the MIT License. See [LICENSE](LICENSE).

</details>
