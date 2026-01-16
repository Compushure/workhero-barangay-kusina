# WorkHero Barangay Kusina - AI Coding Agent Instructions

## Project Overview

Next.js 16 + Supabase application for employee management with role-based access (superadmin, manager, hr, regular). Custom port: **3008** (`npm run dev`).

## Architecture Patterns

### Server Actions Pattern

Use the **3-layer pattern** consistently:

1. **Actions** (`src/actions/*.ts`) - Server actions with `'use server'` directive
   - Direct Supabase client calls
   - Return `ServerActionResponse<T>` type from `@/lib/utils/safe-action`
   - Example: `src/actions/manage.ts`, `src/actions/auth.ts`

2. **Action Handlers** (`src/action-handlers/*.ts`) - Client-side wrappers
   - Wrap actions with `safeAction()` for consistent error handling
   - Handle UI feedback via `toast` from `sonner`
   - Example: `src/action-handlers/manage.ts` wraps actions with toast notifications

3. **TanStack Query Hooks** (`src/hooks/tanstack/`) - React Query integration
   - Mutations in `mutations/` (cache invalidation, optimistic updates)
   - Queries in `queries/` (data fetching with query keys)
   - Always invalidate relevant query keys after mutations

### Supabase Client Usage

**Critical:** Use the correct client for the context:

```typescript
// Server Components/Actions
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient(); // async, uses Next.js cookies()

// Client Components
import { createClient } from '@/lib/supabase/client';
const supabase = createClient(); // sync, browser-based

// Admin operations (service role)
import { supabaseAdmin } from '@/lib/supabase/admin';
// NEVER expose admin client in client components
```

### Role-Based Routing

Roles: `superadmin`, `manager`, `hr`, `regular`/`employee`

- Routes: `/admin/manage` (superadmin), `/manager/dashboard`, `/hr/dashboard`, `/employee/dashboard`
- Auth helpers: `getUserRole()`, `protectAdminRoute()` in `src/actions/auth.ts`
- Client-side routing: `role-router.ts` with toast notifications
- Server-side redirects: `redirectToCorrectDashboardServer()` after login

### Type Safety

- **Zod schemas** in `src/zod/schemas/` for validation (auth, user, search)
- **Types** in `src/types/index.ts` (User, AddUserInput, EditUserInput, UserQueryParams)
- Infer types from Zod: `type AddUserInput = z.infer<typeof addUserSchema>`
- `ServerActionResponse<T>` for all server actions returns

## Key Conventions

### File Organization

- **Components**: Role-specific folders (`components/admin/`, `components/employee/`)
- **Modals**: Place in `components/{role}/modals/` subdirectories
- **Shadcn/ui**: All UI components in `components/ui/` (badge, button, card, dialog, etc.)
- **Actions vs Handlers**: Actions are server-side, handlers are client wrappers

### State Management

- **TanStack Query** for server state (preferred over direct action calls)
- **Zustand** available but use TanStack Query for API data
- **useDebounce** hook at `src/hooks/useDebounce.ts` for search inputs (300ms default)

### Styling

- **Tailwind CSS 4** with CSS variables
- **Shadcn/ui** components (New York style, configured in `components.json`)
- Use `cn()` utility from `@/lib/utils` for class merging
- No custom CSS unless absolutely necessary

### Error Handling

```typescript
// Server actions return this shape:
export type ServerActionResponse<T = void> =
  | { error: null; data?: T }
  | { error: string; data?: never };

// Wrap with safeAction in handlers:
const result = await safeAction(() => myAction(data));
if (!result.success) {
  toast.error(result.error);
  return null;
}
```

## Development Workflows

### Running the App

```bash
npm run dev        # Start on port 3008
npm run build      # Production build
npm run typecheck  # TypeScript validation
npm run lint       # ESLint check
npm run format     # Prettier format
```

### Supabase Setup

Local development uses Supabase migration files in `supabase/migrations/`. Seed data in `supabase/seeds/seed.sql`.

**Required ENV variables:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL (admin client)
SUPABASE_SERVICE_ROLE_KEY (admin client)
```

### Adding New Features

**For new server actions:**

1. Create action in `src/actions/` with `'use server'` and return `ServerActionResponse<T>`
2. Create handler in `src/action-handlers/` wrapping with `safeAction()` and toast
3. Create TanStack mutation/query in `src/hooks/tanstack/`
4. Use mutation in component

**For new UI components:**

1. Use Shadcn CLI: `npx shadcn@latest add [component]`
2. Components auto-install to `src/components/ui/`
3. Imports use aliases: `@/components/ui/button`

## Critical Code Patterns

### Query Keys Pattern (TanStack Query)

```typescript
// Define in queries file:
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
};

// Invalidate after mutations:
queryClient.invalidateQueries({ queryKey: userKeys.lists() });
```

### Protected Routes

Server components/actions must call `protectAdminRoute()` for superadmin access. Uses Supabase claims to verify `user_role`.

### Form Validation

All forms use **react-hook-form** with **Zod resolvers**:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addUserSchema } from '@/zod/schemas'

const form = useForm({
  resolver: zodResolver(addUserSchema),
  defaultValues: { ... }
})
```

## Path Aliases

```json
{
  "@/components": "src/components",
  "@/lib": "src/lib",
  "@/hooks": "src/hooks",
  "@/actions": "src/actions",
  "@/types": "src/types",
  "@/zod": "src/zod"
}
```

## Common Pitfalls

- ❌ Don't use `createClient()` from server module in client components
- ❌ Don't forget `'use server'` directive in server actions
- ❌ Don't call actions directly - use action handlers with toast
- ❌ Don't expose `supabaseAdmin` or service role key to client
- ❌ Don't mix sync/async Supabase client creation patterns
- ✅ Always use query keys for cache invalidation
- ✅ Always wrap server actions with `safeAction()` in handlers
- ✅ Use existing Shadcn components before creating custom ones
