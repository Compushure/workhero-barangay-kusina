# Reward Request System - Fix Summary

## Problem Identified

The `RewardRequest` table in the database was missing the `quantity` column, which prevented the system from properly storing and displaying the number of items requested in each redemption request.

## Changes Made

### 1. Database Migration (NEW FILE)

**File:** `supabase/migrations/20260130000000_add_rewardrequest_quantity.sql`

Added the missing `quantity` column to the `RewardRequest` table:

- Default value: 1
- NOT NULL constraint
- Updates existing records to have quantity = 1

### 2. Existing System Components (Already Working)

The following components are already properly implemented and working:

#### Employee Side (Mercado Page)

**File:** `src/app/employee/mercado/page.tsx`

- ✅ Fetches active rewards from database
- ✅ Displays user's current points
- ✅ Shows quantity selector for each reward
- ✅ Validates user has enough points before submission
- ✅ Checks for pending requests to prevent duplicates
- ✅ Creates redemption request via `useCreateRedemptionRequest()` hook

#### Server Actions

**File:** `src/actions/hr.ts`

- ✅ `getRedemptionRequestsAction()` - Fetches all redemption requests for HR
- ✅ `getMyRedemptionRequestsAction()` - Fetches user's own requests
- ✅ `createRedemptionRequestAction()` - Creates new redemption request
- ✅ `acceptRedemptionRequestAction()` - Approves request and deducts points
- ✅ `declineRedemptionRequestAction()` - Rejects request

#### TanStack Query Hooks

**File:** `src/hooks/tanstack/queries/redemptionQueries.ts`

- ✅ `useGetRedemptionRequests()` - For HR to view all requests
- ✅ `useGetMyRedemptionRequests()` - For employees to view their requests

**File:** `src/hooks/tanstack/mutations/hrMutations.ts`

- ✅ `useCreateRedemptionRequest()` - For creating new requests
- ✅ `useAcceptRedemptionRequest()` - For HR to approve
- ✅ `useDeclineRedemptionRequest()` - For HR to decline

#### HR Dashboard

**File:** `src/components/hr/reward-requests/reward-requests-content.tsx`

- ✅ Fetches pending redemption requests
- ✅ Provides search and sort functionality
- ✅ Displays requests in RedemptionTable component

**File:** `src/components/hr/dashboard/redemption-table.tsx`

- ✅ Displays request date, employee, item(s), total cost
- ✅ Shows quantity in format: "2 x Reward Name"
- ✅ Calculates total cost: `pointsCost * quantity`
- ✅ Accept/Decline buttons with remarks dialog

## How to Apply the Migration

### Option 1: If using Supabase CLI locally

```bash
# Navigate to project root
cd "c:\Users\Client\WORK HERO\workhero-barangay-kusina"

# Apply migrations
supabase db reset
# OR
supabase db push
```

### Option 2: Manual SQL execution

1. Connect to your Supabase database dashboard
2. Go to SQL Editor
3. Run the following SQL:

```sql
ALTER TABLE "public"."RewardRequest"
ADD COLUMN IF NOT EXISTS "quantity" integer DEFAULT 1 NOT NULL;

COMMENT ON COLUMN "public"."RewardRequest"."quantity" IS 'Number of reward items being requested';

UPDATE "public"."RewardRequest"
SET "quantity" = 1
WHERE "quantity" IS NULL;
```

### Option 3: If using a remote Supabase project

1. Push the migration file to your repository
2. Use Supabase CLI to link and push:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Testing the Complete Flow

### 1. Test Employee Redemption Request Creation

1. **Login as an employee**
   - Navigate to `/employee/mercado`

2. **Verify the mercado page displays:**
   - Your current points balance
   - List of available rewards
   - Quantity selectors for each reward

3. **Create a redemption request:**
   - Select a reward
   - Adjust quantity using +/- buttons
   - Click "Redeem" button
   - Should see success toast: "Redemption request submitted successfully"

4. **Verify validations work:**
   - Try to redeem with insufficient points (should show error)
   - Try to redeem again for same item (should disable button if pending)
   - Try to exceed redeeming limit if set (should limit quantity)

### 2. Test HR Redemption Request Management

1. **Login as HR**
   - Navigate to `/hr/reward-requests`

2. **Verify the requests page displays:**
   - List of pending redemption requests
   - Request date and time
   - Employee name
   - Requested item(s) with quantity (e.g., "2 x Premium Reward")
   - Total cost (pointsCost × quantity)

3. **Test Accept functionality:**
   - Click the green checkmark button
   - Optional: Add remarks in the dialog
   - Click OK
   - Should see success toast
   - Request should disappear from pending list
   - Employee's points should be deducted

4. **Test Decline functionality:**
   - Click the red X button
   - Enter reason for declining (required)
   - Click Confirm
   - Should see success toast
   - Request should disappear from pending list
   - Employee's points should NOT be deducted

### 3. Test Query Features

1. **Search functionality:**
   - Type employee name or reward name in search box
   - Should filter results in real-time

2. **Sort functionality:**
   - Test sorting by date (ascending/descending)
   - Test sorting by cost (ascending/descending)
   - Test sorting by employee name

3. **Pagination:**
   - If more than 8 requests, pagination should appear
   - Test navigating between pages

### 4. Verify Database Updates

After accepting a request, verify in Supabase dashboard:

1. **RewardRequest table:**
   - Status should change from 'pending' to 'approved'
   - `approved_by` should be set to the HR user's ID
   - `quantity` should be stored correctly

2. **User table:**
   - Employee's points should be reduced by (pointsCost × quantity)

## Data Flow Summary

```
Employee Side:
1. Employee views mercado page
2. Selects reward and quantity
3. Submits redemption request
   → createRedemptionRequestAction()
   → Inserts row into RewardRequest table with status='pending'

HR Side:
1. HR views reward requests page
2. Fetches pending requests
   → getRedemptionRequestsAction()
   → Joins User and Reward tables
   → Returns RedemptionRequest[] with quantity
3. HR approves request
   → acceptRedemptionRequestAction()
   → Updates RewardRequest.status = 'approved'
   → Deducts points from User table
4. OR HR declines request
   → declineRedemptionRequestAction()
   → Updates RewardRequest.status = 'rejected'
   → Points remain unchanged
```

## Key Files Reference

### Database

- Migration: `supabase/migrations/20260130000000_add_rewardrequest_quantity.sql`
- Schema: `supabase/migrations/20251214011813_remote_schema.sql`

### Server Actions

- `src/actions/hr.ts` - All redemption-related server actions

### Action Handlers (Client-side wrappers)

- `src/action-handlers/hr.ts` - Wraps actions with toast notifications

### TanStack Query

- `src/hooks/tanstack/queries/redemptionQueries.ts` - Query hooks
- `src/hooks/tanstack/mutations/hrMutations.ts` - Mutation hooks

### Employee UI

- `src/app/employee/mercado/page.tsx` - Mercado page with rewards

### HR UI

- `src/app/hr/reward-requests/page.tsx` - Reward requests page
- `src/components/hr/reward-requests/reward-requests-content.tsx` - Main content component
- `src/components/hr/dashboard/redemption-table.tsx` - Table displaying requests
- `src/components/hr/dashboard/remarks.tsx` - Remarks dialog component

### Types

- `src/types/hr/redemption.ts` - TypeScript interfaces

## Troubleshooting

### Issue: Quantity not showing in HR table

**Solution:** Ensure migration has been applied to add the `quantity` column.

### Issue: "Failed to fetch redemption requests"

**Solution:** Check Supabase logs for RLS (Row Level Security) errors. Ensure authenticated users have access to the RewardRequest table.

### Issue: Points not being deducted on approval

**Solution:** Check `acceptRedemptionRequestAction()` - it should update both RewardRequest status and User points in a transaction.

### Issue: Employee can redeem same item multiple times

**Solution:** The system checks for pending requests before allowing redemption. If issue persists, verify the `useGetMyRedemptionRequests('pending')` query is working.

## Next Steps (Optional Enhancements)

1. **Add request history page for employees** to view approved/rejected requests
2. **Add email notifications** when requests are approved/declined
3. **Add batch approval** for HR to approve multiple requests at once
4. **Add request cancellation** for employees to cancel pending requests
5. **Add reporting dashboard** showing redemption statistics
