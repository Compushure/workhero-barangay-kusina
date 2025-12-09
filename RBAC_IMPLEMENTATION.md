# Role-Based Access Control (RBAC) Implementation

## Overview

A comprehensive RBAC system has been implemented with a 4-level role hierarchy enforcing permissions across all user management operations.

## Role Hierarchy

```
superadmin (Level 4) - Full access to all operations
    ↓
manager (Level 3) - Can view users and manage staff
    ↓
hr (Level 2) - Can add/edit/view users
    ↓
regular (Level 1) - No management permissions
```

## Files Modified/Created

### 1. **`src/lib/rbac/roles.ts`** (NEW)

Core RBAC system with utilities and constants.

**Key Exports:**

- `ROLE_HIERARCHY`: Numeric role levels for comparison
- `hasMinimumRole(userRole, minimumRole)`: Check if user meets role threshold
- `hasRole(userRole, role)`: Exact role match check
- `hasAnyRole(userRole, roles)`: Check if user has any specified roles
- `PERMISSIONS`: Operation-level permission predicates
- `ROLE_ERROR_MESSAGES`: Standardized error messages for UI

### 2. **`src/actions/auth.ts`** (ENHANCED)

Server-side authentication logic with role checks.

**New Function:**

```typescript
export async function checkAdminAccess(): Promise<{
  authorized: boolean
  role: string | null
  error: string | null
}>
```

- Returns object instead of redirecting
- Enables flexible role checking
- Returns standardized error messages

### 3. **`src/action-handlers/auth.ts`** (ENHANCED)

Client-side auth handlers with UI feedback.

**New Function:**

```typescript
export async function handleCheckAdminAccess(): Promise<{
  authorized: boolean
  role: string | null
  error: string | null
}>
```

- Wraps server action with error handling
- Shows toast notification on access denial
- Returns role info for component-level decisions

### 4. **`src/actions/manage.ts`** (ENHANCED)

User management actions with role-based access control.

**Role Checks Implemented:**

| Action               | Required Role   | Error Message    |
| -------------------- | --------------- | ---------------- |
| `fetchUsersAction()` | Manager+        | MANAGER_OR_ABOVE |
| `addUserAction()`    | HR+             | HR_OR_ABOVE      |
| `editUserAction()`   | HR+             | HR_OR_ABOVE      |
| `deleteUserAction()` | Superadmin Only | SUPERADMIN_ONLY  |

**Implementation Pattern:**

```typescript
// Check role at start of function
const { role } = await getUserRole()
if (!role || !hasMinimumRole(role, 'hr')) {
  return { error: ROLE_ERROR_MESSAGES.HR_OR_ABOVE }
}
```

## Authorization Flow

```
Component (TanStack Mutation)
    ↓
Server Action (manage.ts)
    ↓
Check Role using getUserRole()
    ↓
Verify Permission with hasMinimumRole() / hasRole()
    ↓
Return Error or Execute Operation
    ↓
Action Handler (catches error, shows toast)
    ↓
Component (displays result or error message)
```

## Error Handling

**Standardized error messages** provided in `ROLE_ERROR_MESSAGES`:

- `SUPERADMIN_ONLY`: "Only superadmins can perform this action"
- `HR_OR_ABOVE`: "Only HR staff and above can perform this action"
- `MANAGER_OR_ABOVE`: "Only managers and above can perform this action"
- `NOT_AUTHORIZED`: "You do not have permission to perform this action"

These messages are:

1. Returned by server actions
2. Caught and displayed as toasts by action-handlers
3. Available for component-level UI decisions

## Permission Matrix

| Operation   | Regular | HR  | Manager | Superadmin |
| ----------- | ------- | --- | ------- | ---------- |
| View Users  | ❌      | ✅  | ✅      | ✅         |
| Add User    | ❌      | ✅  | ✅      | ✅         |
| Edit User   | ❌      | ✅  | ✅      | ✅         |
| Delete User | ❌      | ❌  | ❌      | ✅         |

## Testing Checklist

- [ ] Superadmin can perform all operations (view, add, edit, delete)
- [ ] Manager can view and manage users, but cannot delete
- [ ] HR can add/edit users, but cannot delete or view as manager
- [ ] Regular users cannot access any management functions
- [ ] Permission denials show appropriate error messages
- [ ] Error toasts display when operations are denied
- [ ] Role-based UI visibility/disabling works on frontend

## Implementation Notes

1. **Role Hierarchy by Value**: Uses numeric values (superadmin: 4, manager: 3, hr: 2, regular: 1) for comparison. A user with role level 3 (manager) has `hasMinimumRole(role, 'hr')` return `true` because 3 >= 2.

2. **Superadmin Delete Only**: Only superadmins can delete users - uses `hasRole()` instead of `hasMinimumRole()` for exact match requirement.

3. **Consistent Error Messages**: All RBAC rejections use standardized messages from `ROLE_ERROR_MESSAGES` for consistent user experience.

4. **Server Action Pattern**: Role checks happen early in server actions to prevent unnecessary processing.

5. **Action Handler Integration**: Error messages from server actions are caught and displayed as toasts via action-handlers.

## Future Enhancements

- Add permission checks to TanStack Query mutations for optimistic UI disabling
- Create frontend utility for checking permissions before rendering buttons
- Add audit logging for permission denials
- Implement fine-grained permissions (e.g., edit own profile vs edit others)
- Add time-based role restrictions (e.g., temporary elevated access)
