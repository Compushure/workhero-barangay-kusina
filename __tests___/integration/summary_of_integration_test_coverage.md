# Integration Test Coverage Summary

## File: __tests___/integration/summary_of_integration_test_coverage.md

## Table of Contents
- [__tests___/integration/manager/badge-editor.integration.test.ts](#__tests___integration_manager_badge-editorintegrationtestts)
- [__tests___/integration/manager/badge-assignment.integration.test.ts](#__tests___integration_manager_badge-assignmentintegrationtestts)
- [__tests___/integration/manager/assigned-tasks.integration.test.ts](#__tests___integration_manager_assigned-tasksintegrationtestts)
- [__tests___/integration/manager/task-verification.integration.test.ts](#__tests___integration_manager_task-verificationintegrationtestts)
- [__tests___/integration/employee/profile.integration.test.ts](#__tests___integration_employee_profileintegrationtestts)
- [__tests___/integration/employee/notifications.integration.test.ts](#__tests___integration_employee_notificationsintegrationtestts)
- [__tests___/integration/employee/employee-stats.integration.test.ts](#__tests___integration_employee_employee-statsintegrationtestts)
- [__tests___/integration/employee/employee-mercado.integration.test.ts](#__tests___integration_employee_employee-mercadointegrationtestts)
- [__tests___/integration/employee/employee-leaderboard.integration.test.ts](#__tests___integration_employee_employee-leaderboardintegrationtestts)
- [__tests___/integration/shared/attendance.integration.test.ts](#__tests___integration_shared_attendanceintegrationtestts)
- [__tests___/integration/hr/reward-requests.integration.test.ts](#__tests___integration_hr_reward-requestsintegrationtestts)
- [__tests___/integration/hr/mercado-items.integration.test.ts](#__tests___integration_hr_mercado-itemsintegrationtestts)
- [__tests___/integration/hr/hr-leaderboard.integration.test.ts](#__tests___integration_hr_hr-leaderboardintegrationtestts)
- [__tests___/integration/superadmin/superadmin.integration.test.ts](#__tests___integration_superadmin_superadminintegrationtestts)

## __tests___/integration/manager/badge-editor.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR BADGE EDITOR (INTEGRATION)</strong></summary>

Describe: When the manager loads remote badge editor data
1. badge editor handlers return the seeded KPI category and badge records from the remote database
Describe: When the manager manages a remote badge
2. badge editor handlers create, update, upload, clear, and delete the remote badge cleanly
</details>

## __tests___/integration/manager/badge-assignment.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR BADGE ASSIGNMENT (INTEGRATION)</strong></summary>

Describe: When the manager loads remote badge assignment data
1. badge assignment handlers return the seeded manual badges, all badges, and users with collected badges
Describe: When the manager awards and removes a remote badge
2. badge assignment handlers create the remote award, update user points, create a notification, and remove the award again
</details>

## __tests___/integration/manager/assigned-tasks.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR ASSIGNED TASKS (INTEGRATION)</strong></summary>

Describe: When the manager loads remote assigned tasks
1. assigned-task handlers return seeded task rows in both task and employee views
Describe: When the manager clears unstarted tasks for a specific employee
2. clear handler removes seeded unstarted assigned tasks only for the target employee
Describe: When the manager deletes a specific assigned task
3. delete handler removes the seeded assignment row
</details>

## __tests___/integration/manager/task-verification.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR TASK VERIFICATION (INTEGRATION)</strong></summary>

Describe: When the manager loads remote tasks for review
1. task verification handlers return the seeded in-review task from the remote view
Describe: When the manager approves a remote task submission
2. task verification handlers update the remote task, clear pending orders, and create a notification
Describe: When the manager rejects a remote task submission
3. task verification handlers update the remote task as rejected and create a rejection notification
</details>

## __tests___/integration/employee/profile.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE PROFILE (INTEGRATION)</strong></summary>

Describe: When the employee loads their remote profile
1. fetchUserProfileByIdHandler returns the seeded remote user record
Describe: When the employee updates their remote profile
2. updateOwnProfileHandler persists the editable fields in the remote database
Describe: When the employee manages their remote profile picture
3. uploadOwnProfilePictureHandler stores the file remotely and deleteOwnProfilePictureHandler removes it
</details>

## __tests___/integration/employee/notifications.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE NOTIFICATIONS (INTEGRATION)</strong></summary>

Describe: When the employee reads their remote notifications
1. handleFetchNotifications handler returns only the seeded notifications for the authenticated employee
Describe: When the employee marks remote notifications as read
2. handleMarkNotificationRead handler updates the selected remote notification
3. handleMarkAllNotificationsRead handler updates every unread remote notification for the employee
</details>

## __tests___/integration/employee/employee-stats.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE STATS (INTEGRATION)</strong></summary>

Describe: When the employee reads remote points and XP data
1. employee stats handlers return the seeded points, XP, and level metadata from the remote database
Describe: When the employee adjusts remote XP for level progression
2. employee stats handler updates the remote XP, total XP, and level fields using the remote level thresholds
</details>

## __tests___/integration/employee/employee-mercado.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE MERCADO (INTEGRATION)</strong></summary>

Describe: When an employee loads Mercado rewards
1. getRewardsAction returns the seeded reward with approved redeemed count
Describe: When an employee loads own Mercado redemption requests
2. getMyRedemptionRequestsAction returns only the current employee pending requests
Describe: When an employee creates and cancels Mercado redemption requests
3. createRedemptionRequestAction deducts points and cancelMyRedemptionRequestAction restores them
</details>

## __tests___/integration/employee/employee-leaderboard.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE LEADERBOARD (INTEGRATION)</strong></summary>

Describe: When the employee reads remote leaderboard period entries
1. top ranks by period handler returns seeded ranking rows with current-user mapping
Describe: When the employee reads the latest remote rank snapshot
2. rank handler returns the current employee rank from the latest visible weekly period
Describe: When leaderboard handlers run without an authenticated employee
3. top ranks by period handler returns null and shows an error toast
</details>

## __tests___/integration/shared/attendance.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR ATTENDANCE (INTEGRATION)</strong></summary>

Describe: When the employee loads remote attendance status without timing in
1. attendance status handler creates an absent remote log after the timeout window closes
Describe: When the employee completes a remote attendance lifecycle
2. attendance handlers time in, start break, end break, time out, and return the remote timeline entries
</details>

## __tests___/integration/hr/reward-requests.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR REWARD REQUESTS (INTEGRATION)</strong></summary>

Describe: When HR loads remote reward requests
1. reward-request handler returns the seeded pending request with user and reward details
Describe: When HR accepts a pending reward request
2. request is approved, stock is deducted, and the employee receives a notification
Describe: When HR declines a pending reward request
3. request is rejected, points are refunded, stock is restored, and the employee receives a notification
</details>

## __tests___/integration/hr/mercado-items.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR MERCADO ITEMS (INTEGRATION)</strong></summary>

Describe: When HR loads Mercado items in the remote database
1. getRewardsAction returns redeemed counts from approved reward requests
Describe: When HR manages Mercado items in the remote database
2. addRewardAction, editRewardAction, and deleteRewardAction persist the expected changes
</details>

## __tests___/integration/hr/hr-leaderboard.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR LEADERBOARD (INTEGRATION)</strong></summary>

Describe: When HR reads enriched leaderboard data for a generated period
1. getEnrichedLeaderboardByPeriod returns enriched players and period metadata
Describe: When HR reads past ranking periods
2. getAllRankingPeriods returns top performer and participant count for seeded period
Describe: When HR leaderboard actions run without an authenticated user
3. getEnrichedLeaderboardByPeriod returns a failed action result with not-authenticated error
4. getAllRankingPeriods returns a failed action result with not-authenticated error
</details>

## __tests___/integration/superadmin/superadmin.integration.test.ts
<details>
<summary><strong>TEST COVERAGE FOR SUPERADMIN USERS (INTEGRATION)</strong></summary>

Describe: When the superadmin creates and lists a remote user
1. user-management actions create the remote user and the list actions return it from the remote filter route
Describe: When the superadmin manages a remote user lifecycle
2. user-management actions update profile data, verify and remove the remote profile picture, and delete the auth and public user records
</details>