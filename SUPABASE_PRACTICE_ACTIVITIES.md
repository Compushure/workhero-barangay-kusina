# Supabase Practice Activities

This document contains hands-on practice activities for working with your Supabase database using the JS client library. Each activity includes mock data and step-by-step instructions.

## Setup

Before starting, make sure you have the Supabase client imported:

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

For server-side operations:

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

---

## Activity 1: Basic CRUD Operations with Roles

**Objective**: Practice basic Create, Read, Update, Delete operations.

### Task 1.1: Create Roles

Create the following roles using mock data:

```typescript
// Mock data for roles
const roles = [{ type: 'Admin' }, { type: 'Manager' }, { type: 'Employee' }, { type: 'Volunteer' }];

// Your code here:
// Insert all roles and log the results
```

**Expected Result**: 4 roles created in the database.

### Task 1.2: Read Roles

Query all roles and display them:

```typescript
// Your code here:
// Fetch all roles and log them
```

### Task 1.3: Update a Role

Update the "Volunteer" role to "Senior Volunteer":

```typescript
// Your code here:
// Find the Volunteer role and update it
```

### Task 1.4: Delete a Role (Optional)

Delete a specific role (be careful with this in production):

```typescript
// Your code here:
// Delete a role by ID
```

---

## Activity 2: Working with Users and Relationships

**Objective**: Practice inserting users with foreign key relationships and querying with joins.

### Task 2.1: Create Users with Roles

First, get the role IDs, then create users:

```typescript
// Step 1: Get all roles to find role IDs
// Step 2: Create users with role relationships

const mockUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role_id: null, // You'll need to get this from the Role table
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role_id: null, // Manager role ID
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role_id: null, // Employee role ID
  },
  {
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    role_id: null, // Volunteer role ID
  },
];

// Your code here:
// 1. Fetch roles
// 2. Map role types to IDs
// 3. Insert users with correct role_ids
```

### Task 2.2: Query Users with Role Information

Fetch all users along with their role details:

```typescript
// Your code here:
// Use select with join syntax to get users and their roles
// Expected: Each user should include their role type
```

### Task 2.3: Filter Users by Role

Get all users who are Managers:

```typescript
// Your code here:
// Query users where role type is 'Manager'
// Hint: You might need to join with Role table
```

---

## Activity 3: KPI System - Categories and Tasks

**Objective**: Practice creating a complete workflow with multiple related tables.

### Task 3.1: Create KPI Categories

Create categories for different types of work:

```typescript
const kpiCategories = [
  {
    name: 'Customer Service',
    description: 'Tasks related to helping customers',
    points: 50,
  },
  {
    name: 'Food Preparation',
    description: 'Tasks related to preparing meals',
    points: 75,
  },
  {
    name: 'Delivery',
    description: 'Tasks related to delivering food',
    points: 100,
  },
  {
    name: 'Cleaning',
    description: 'Tasks related to maintaining cleanliness',
    points: 25,
  },
  {
    name: 'Administration',
    description: 'Administrative and paperwork tasks',
    points: 30,
  },
];

// Your code here:
// Insert all KPI categories
```

### Task 3.2: Create KPI Tasks

Create tasks assigned to users:

```typescript
// First, get user IDs and category IDs
// Then create tasks

const mockTasks = [
  {
    assigned_to: null, // User ID (e.g., Alice)
    assigned_by: null, // Manager user ID (e.g., Bob)
    category_id: null, // Customer Service category ID
    status: 'pending',
  },
  {
    assigned_to: null, // User ID (e.g., Charlie)
    assigned_by: null, // Manager user ID (e.g., Bob)
    category_id: null, // Food Preparation category ID
    status: 'pending',
  },
  {
    assigned_to: null, // User ID (e.g., Diana)
    assigned_by: null, // Manager user ID (e.g., Bob)
    category_id: null, // Delivery category ID
    status: 'in_progress',
  },
];

// Your code here:
// 1. Fetch users and categories
// 2. Map names to IDs
// 3. Insert tasks with proper relationships
```

### Task 3.3: Query Tasks with Full Details

Get all tasks with assignee, assigner, and category information:

```typescript
// Your code here:
// Use nested select to get:
// - Task details
// - Assignee (User) details
// - Assigner (User) details
// - Category details including points
```

### Task 3.4: Mark Tasks as Completed

Update tasks to completed status:

```typescript
// Your code here:
// Update tasks to status 'completed' and set completed_at timestamp
// Filter by specific task IDs or user IDs
```

### Task 3.5: Calculate Points Earned

Query to calculate total points a user has earned from completed tasks:

```typescript
// Your code here:
// Get all completed tasks for a user
// Join with KPICategory to get points
// Calculate total points
// Expected output: { userId, userName, totalPoints: number }
```

---

## Activity 4: Reward System

**Objective**: Practice creating and managing rewards and reward requests.

### Task 4.1: Create Rewards

Create various rewards that users can redeem:

```typescript
// First, get a user ID (for created_by field)
// Then create rewards

const rewards = [
  {
    name: 'Free Meal Voucher',
    points_cost: 100,
    category: 'Food',
    is_active: true,
    created_by: null, // User ID
  },
  {
    name: 'Coffee Break',
    points_cost: 50,
    category: 'Beverage',
    is_active: true,
    created_by: null,
  },
  {
    name: 'Extra Day Off',
    points_cost: 500,
    category: 'Time Off',
    is_active: true,
    created_by: null,
  },
  {
    name: 'Gift Card - $25',
    points_cost: 250,
    category: 'Gift',
    is_active: true,
    created_by: null,
  },
  {
    name: 'Company Swag',
    points_cost: 150,
    category: 'Merchandise',
    is_active: false, // Inactive reward
    created_by: null,
  },
];

// Your code here:
// Insert all rewards
```

### Task 4.2: Query Active Rewards

Get all active rewards, sorted by points cost:

```typescript
// Your code here:
// Filter by is_active = true
// Order by points_cost ascending
```

### Task 4.3: Filter Rewards by Category

Get all food-related rewards:

```typescript
// Your code here:
// Filter rewards where category = 'Food' and is_active = true
```

### Task 4.4: Create Reward Requests

Simulate users requesting rewards:

```typescript
// Get user IDs and reward IDs first
// Then create reward requests

const rewardRequests = [
  {
    user_id: null, // User ID
    reward_id: null, // Free Meal Voucher ID
    status: 'pending',
  },
  {
    user_id: null, // Different user ID
    reward_id: null, // Coffee Break ID
    status: 'pending',
  },
];

// Your code here:
// Insert reward requests
```

### Task 4.5: Query Reward Requests with Details

Get all reward requests with user and reward information:

```typescript
// Your code here:
// Use nested select to get:
// - Request details (status, requested_at)
// - User details (name, email)
// - Reward details (name, points_cost)
```

### Task 4.6: Approve Reward Requests

Simulate a manager approving reward requests:

```typescript
// Your code here:
// Update reward requests to status 'approved'
// Set approved_by to a manager's user ID
// Filter by specific request IDs or user IDs
```

---

## Activity 5: Dishes and Levels

**Objective**: Practice working with simpler tables and implementing business logic.

### Task 5.1: Create Dishes

Add menu items to the Dishes table:

```typescript
const dishes = [
  {
    name: 'Adobo',
    description: 'Classic Filipino adobo with chicken or pork',
    rng: 0.1,
  },
  {
    name: 'Sinigang',
    description: 'Sour tamarind soup with vegetables',
    rng: 0.2,
  },
  {
    name: 'Lechon Kawali',
    description: 'Crispy fried pork belly',
    rng: 0.3,
  },
  {
    name: 'Kare-Kare',
    description: 'Oxtail and vegetables in peanut sauce',
    rng: 0.4,
  },
  {
    name: 'Pancit',
    description: 'Stir-fried noodles with vegetables',
    rng: 0.5,
  },
  {
    name: 'Lumpia',
    description: 'Filipino spring rolls',
    rng: 0.6,
  },
];

// Your code here:
// Insert all dishes
```

### Task 5.2: Get Random Dish

Implement a function to get a random dish (using the rng field):

```typescript
// Your code here:
// Generate a random number between 0 and 1
// Find the dish with the closest rng value
// Or: Order by rng and pick one randomly
```

### Task 5.3: Search Dishes

Implement a search function for dishes:

```typescript
// Your code here:
// Create a function that searches dishes by name or description
// Use ilike for case-insensitive search
// Function signature: searchDishes(searchTerm: string)
```

### Task 5.4: Create User Levels

Create level system with perks:

```typescript
const levels = [
  {
    level: 1,
    perk: 'Welcome bonus: 50 points',
  },
  {
    level: 2,
    perk: 'Free coffee on Fridays',
  },
  {
    level: 3,
    perk: '10% discount on all rewards',
  },
  {
    level: 4,
    perk: 'Monthly free meal',
  },
  {
    level: 5,
    perk: 'VIP status: Priority support',
  },
];

// Your code here:
// Insert all levels
```

### Task 5.5: Get Level by Number

Query a specific level:

```typescript
// Your code here:
// Get level 3 and display its perk
```

---

## Activity 6: Advanced Queries and Aggregations

**Objective**: Practice complex queries, aggregations, and data analysis.

### Task 6.1: User Statistics

Create a query that returns user statistics:

```typescript
// Your code here:
// For each user, get:
// - User name and email
// - Role type
// - Count of assigned tasks
// - Count of completed tasks
// - Count of pending reward requests
// Hint: You may need multiple queries or use aggregations
```

### Task 6.2: Most Popular Rewards

Find which rewards are requested most often:

```typescript
// Your code here:
// Group reward requests by reward_id
// Count requests per reward
// Join with Reward table to get reward names
// Order by count descending
```

### Task 6.3: Task Completion Rate by Category

Calculate completion rates for each KPI category:

```typescript
// Your code here:
// For each category:
// - Total tasks assigned
// - Completed tasks count
// - Calculate completion percentage
// Order by completion rate
```

### Task 6.4: User Points Summary

Create a summary showing:

- Total points available from completed tasks
- Total points spent on approved rewards
- Net points balance

```typescript
// Your code here:
// This is a complex query - break it down:
// 1. Get all completed tasks for a user with category points
// 2. Sum the points (this is earned points)
// 3. Get all approved reward requests for the user
// 4. Sum the reward points_cost (this is spent points)
// 5. Calculate balance = earned - spent
```

---

## Activity 7: Real-time Subscriptions

**Objective**: Practice using Supabase real-time features.

### Task 7.1: Subscribe to Task Changes

Set up a real-time subscription for KPITask changes:

```typescript
// Your code here:
// Create a channel subscription
// Listen for INSERT, UPDATE, DELETE events
// Log changes to console
// Don't forget to unsubscribe when done!
```

### Task 7.2: Subscribe to Reward Requests

Monitor new reward requests in real-time:

```typescript
// Your code here:
// Subscribe to RewardRequest table
// Only listen for INSERT events (new requests)
// Display a notification when a new request comes in
```

---

## Activity 8: Error Handling and Best Practices

**Objective**: Practice proper error handling and validation.

### Task 8.1: Create with Error Handling

Create a function that safely inserts a user:

```typescript
// Your code here:
// Function: createUser(userData)
// - Validate email format
// - Check if email already exists
// - Handle errors gracefully
// - Return success/error response
```

### Task 8.2: Transaction-like Operations

Simulate approving a reward request and deducting points:

```typescript
// Your code here:
// 1. Check if user has enough points (from completed tasks)
// 2. Approve the reward request
// 3. Handle errors - if step 2 fails, don't proceed
// Note: Supabase doesn't have transactions in JS client,
// but you can simulate with proper error handling
```

### Task 8.3: Batch Operations with Validation

Insert multiple tasks with validation:

```typescript
// Your code here:
// Create a function that:
// - Validates all task data before inserting
// - Checks if users exist
// - Checks if categories exist
// - Only inserts if all validations pass
// - Returns detailed success/error information
```

---

## Activity 9: Pagination and Filtering

**Objective**: Practice implementing pagination and advanced filtering.

### Task 9.1: Paginated Task List

Implement pagination for tasks:

```typescript
// Your code here:
// Function: getTasks(page: number, pageSize: number)
// - Calculate range using (page - 1) * pageSize
// - Use .range() method
// - Return tasks and total count
// - Handle edge cases (page out of bounds, etc.)
```

### Task 9.2: Filtered Reward Search

Create an advanced reward search:

```typescript
// Your code here:
// Function: searchRewards(filters)
// Filters object should support:
// - category: string
// - minPoints: number
// - maxPoints: number
// - isActive: boolean
// - Sort by: 'points_cost' | 'name' | 'created_at'
// - Sort order: 'asc' | 'desc'
```

### Task 9.3: Date Range Queries

Query tasks created within a date range:

```typescript
// Your code here:
// Function: getTasksByDateRange(startDate: Date, endDate: Date)
// - Filter tasks where created_at is between dates
// - Include timezone handling
// - Return formatted results
```

---

## Activity 10: Complete Workflow Simulation

**Objective**: Simulate a complete business workflow.

### Task 10.1: Employee Onboarding

Create a complete onboarding flow:

```typescript
// Your code here:
// Simulate onboarding a new employee:
// 1. Create a new user with Employee role
// 2. Assign them to Level 1
// 3. Create 3 initial tasks (different categories)
// 4. Grant welcome bonus (create a special reward request)
// Return summary of all created records
```

### Task 10.2: Task Completion Workflow

Simulate a complete task completion:

```typescript
// Your code here:
// 1. Get a pending task
// 2. Mark it as completed
// 3. Calculate points earned
// 4. Check if user can afford any rewards
// 5. Suggest available rewards
// Return completion summary
```

### Task 10.3: Reward Redemption Flow

Complete reward redemption process:

```typescript
// Your code here:
// 1. User requests a reward
// 2. Check if user has enough points
// 3. If yes, create reward request
// 4. Manager approves request
// 5. Calculate new point balance
// 6. Return redemption confirmation
```

---

## Bonus Challenges

### Challenge 1: Leaderboard

Create a leaderboard showing top users by points:

```typescript
// Your code here:
// Calculate points for each user
// Rank users by total points
// Include user name, role, and points
// Limit to top 10
```

### Challenge 2: Activity Feed

Create an activity feed that shows:

- New tasks assigned
- Tasks completed
- Rewards requested
- Rewards approved

```typescript
// Your code here:
// Query multiple tables
// Combine results
// Sort by timestamp
// Format as activity feed items
```

### Challenge 3: Analytics Dashboard Data

Create queries for an analytics dashboard:

```typescript
// Your code here:
// 1. Total active users
// 2. Tasks completed this month
// 3. Total points awarded
// 4. Most popular reward category
// 5. Average task completion time
// Return as a dashboard data object
```

---

## Practice Tips

1. **Start Simple**: Begin with Activity 1 and work your way up
2. **Test Incrementally**: Test each task before moving to the next
3. **Read Errors**: Supabase provides helpful error messages - read them carefully
4. **Use Console Logging**: Log your queries and results to understand what's happening
5. **Check RLS Policies**: If you get permission errors, check Row Level Security policies
6. **Use TypeScript**: Take advantage of type safety with Supabase's TypeScript support

## Getting Help

- Check the [Supabase JS Client Documentation](https://supabase.com/docs/reference/javascript/introduction)
- Review the `SUPABASE_TABLES_REFERENCE.md` for table structures
- Use Supabase's built-in query inspector in the dashboard

## Next Steps

After completing these activities:

1. Build actual features using these patterns
2. Implement proper error handling
3. Add loading states and user feedback
4. Consider implementing caching strategies
5. Add unit tests for your database functions

Happy coding! 🚀
