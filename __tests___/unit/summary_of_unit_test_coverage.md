# Unit Test Coverage Summary

## File: __tests___/unit/summary_of_unit_test_coverage.md

## Table of Contents
- [__tests___/mercado-interval-helpers.test.ts](#__tests___mercado-interval-helperstestts)
- [__tests___/unit/employee/profile.test.ts](#__tests___unit_employee_profiletestts)
- [__tests___/unit/employee/notifications.test.ts](#__tests___unit_employee_notificationstestts)
- [__tests___/unit/employee/employee-stats.test.ts](#__tests___unit_employee_employee-statstestts)
- [__tests___/unit/employee/employee-mercado.test.ts](#__tests___unit_employee_employee-mercadotestts)
- [__tests___/unit/employee/employee-leaderboard.test.ts](#__tests___unit_employee_employee-leaderboardtestts)
- [__tests___/unit/shared/attendance.test.ts](#__tests___unit_shared_attendancetestts)
- [__tests___/unit/manager/badge-editor.test.ts](#__tests___unit_manager_badge-editortestts)
- [__tests___/unit/manager/badge-assignment.test.ts](#__tests___unit_manager_badge-assignmenttestts)
- [__tests___/unit/manager/assigned-tasks.test.ts](#__tests___unit_manager_assigned-taskstestts)
- [__tests___/unit/manager/task-verification.test.ts](#__tests___unit_manager_task-verificationtestts)
- [__tests___/unit/hr/hr-leaderboard.test.ts](#__tests___unit_hr_hr-leaderboardtestts)
- [__tests___/unit/hr/mercado-items.test.ts](#__tests___unit_hr_mercado-itemstestts)
- [__tests___/unit/hr/rewards-requests.test.ts](#__tests___unit_hr_rewards-requeststestts)
- [__tests___/unit/superadmin/superadmin.test.ts](#__tests___unit_superadmin_superadmintestts)

## __tests___/mercado-interval-helpers.test.ts
<details>
<summary><strong>TEST COVERAGE FOR MERCADO INTERVAL HELPERS</strong></summary>

Describe: Mercado interval helpers
1. marks weekly items as expired after Saturday
2. weekly date ranges span Monday through Saturday
</details>

## __tests___/unit/employee/profile.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE PROFILE (UNIT)</strong></summary>

Describe: When the employee loads a profile
1. fetchUserProfileById action returns normalized profile details
2. fetchUserProfileById action returns a readable error when the profile is missing
3. fetchUserProfileByIdHandler returns null and shows a toast when the action reports an error
Describe: When the employee updates their own profile
4. updateOwnProfile action sends only the editable profile fields to the RPC
5. updateOwnProfile action blocks the request when there is no active session
6. updateOwnProfileHandler returns null and shows a toast when the action fails
Describe: When the employee uploads a profile picture
7. uploadOwnProfilePicture action stores the file in the employees bucket
8. uploadOwnProfilePictureHandler returns null and shows a toast when the action fails
Describe: When the employee removes a profile picture
9. deleteOwnProfilePicture action removes the storage object for the current user
10. deleteOwnProfilePictureHandler returns false and shows a toast when the action fails
</details>

## __tests___/unit/employee/notifications.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE NOTIFICATIONS (UNIT)</strong></summary>

Describe: When the employee opens the notifications list
1. fetchNotifications action returns normalized notification items
2. fetchNotifications action stops when the employee is not authenticated
3. handleFetchNotifications handler forwards the action error without showing a toast
Describe: When the employee marks a single notification as read
4. markNotificationRead action updates the current notification row
5. handleMarkNotificationRead handler returns an error and shows a toast when the action fails
Describe: When the employee marks all notifications as read
6. markAllNotificationsRead action updates every unread notification for the current employee
7. handleMarkAllNotificationsRead handler shows a success toast after the action succeeds
</details>

## __tests___/unit/employee/employee-stats.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE STATS (UNIT)</strong></summary>

Describe: When the employee reads points and XP data
1. getEmployeePoints action returns the current points and deducted points
2. getEmployeeXP action falls back to derived total XP when the stored total is missing
3. handleFetchEmployeePoints handler returns the points data without showing a toast
4. handleFetchEmployeeXP handler returns null and shows an error toast when the action fails
Describe: When the employee reads level thresholds
5. getXPRequiredForNextLevel action returns zero at the level cap
6. getAllLevelMetadata action returns the fallback level list when the Level table is empty
7. handlers return threshold and metadata data without showing error toasts on the happy path
Describe: When the employee adjusts active XP for level progression
8. adjustActiveUserXPByDelta action updates XP, total XP, and level using the level thresholds
9. adjustActiveUserXPByDelta action floors total XP at zero when a large negative delta is applied
10. handleAdjustActiveUserXPByDelta handler returns null and shows an error toast when the update fails
</details>

## __tests___/unit/employee/employee-mercado.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE MERCADO (UNIT)</strong></summary>

Describe: When the employee loads Mercado page data
1. useMercadoPageData returns available rewards, pending requests, and points
2. useMercadoPageData disables reward loading when includeRewards is false
3. useMercadoPageData surfaces loading when any underlying query is loading
4. useMercadoPageData preserves reward query errors only when rewards are included
Describe: When the employee orders and cancels Mercado items
5. handleCreateRedemptionRequestAction returns true when the order request succeeds
6. handleCreateRedemptionRequestAction returns false and shows an error toast when ordering fails
7. handleCancelMyRedemptionRequestAction returns true when cancellation succeeds
8. handleCancelMyRedemptionRequestAction returns false and shows an error toast when cancellation fails
</details>

## __tests___/unit/employee/employee-leaderboard.test.ts
<details>
<summary><strong>TEST COVERAGE FOR EMPLOYEE LEADERBOARD (UNIT)</strong></summary>

Describe: When the employee reads leaderboard snapshots
1. getEmployeeRank action returns rank, performance score, and total employees
2. getEmployeeTopWeeklyRanks action returns mapped top entries with profile URLs
3. getEmployeeTopRanksByPeriod action returns null when no visible rows exist for the period
Describe: When employee leaderboard handlers process action responses
4. leaderboard handlers return data without showing error toasts on the happy path
5. period leaderboard handler returns null and shows an error toast when the user is unauthenticated
</details>

## __tests___/unit/shared/attendance.test.ts
<details>
<summary><strong>TEST COVERAGE FOR ATTENDANCE (UNIT)</strong></summary>

Describe: When the employee loads attendance configuration data
1. getAttendanceConfigAction action returns the configured attendance windows
2. handleGetAttendanceConfig handler forwards the configuration without showing an error toast
Describe: When the employee loads the attendance timeline
3. getTodayAttendanceTimelineAction action returns the ordered timeline with late, break, and undertime notes
4. handleGetTodayAttendanceTimeline handler returns the timeline entries when the action succeeds
Describe: When the employee loads the current attendance status
5. getTodayAttendanceStatusAction action auto-marks the day absent when no time in exists after timeout
6. handleGetTodayAttendanceStatus handler returns the current break state without showing a toast
Describe: When the employee records attendance actions
7. timeInAttendanceAction action creates the first attendance log for the day
8. timeOutAttendanceAction action prevents timing out while the employee is still on break
9. startBreakAction action starts the current break and the handler shows a success toast
10. endBreakAction action marks the break as over duration when it exceeds the configured limit
11. handleTimeOutAttendance handler updates the log and shows a success toast after timing out
12. handleTimeInAttendance handler returns an error and shows a toast when time in is outside the allowed window
13. handleEndBreak handler shows the over-break toast when the employee exceeded the break duration
</details>

## __tests___/unit/manager/badge-editor.test.ts
<details>
<summary><strong>TEST COVERAGE FOR BADGE EDITOR (UNIT)</strong></summary>

Describe: Badge Editor Server Actions
1. fetchBadges returns normalized badges
2. fetchBadges returns error on query failure
3. fetch badge options returns task options
4. fetch badge options handles task option error
5. fetch badge options attribute options are static
6. fetch badge options attendance options are static
7. uploadBadgeImage rejects oversized file
8. uploadBadgeImage rejects unsupported type
9. uploadBadgeImage returns error when upload fails
10. uploadBadgeImage returns error when update fails
11. uploadBadgeImage uploads and returns public url
12. deleteBadgeImage removes image and clears column
13. deleteBadgeImage handles storage removal error
14. deleteBadgeImage handles badge image clear error
15. addBadge rejects invalid input
16. addBadge creates badge with requirements
17. addBadge returns error when badge insert fails
18. addBadge returns error when requirement insert fails
19. editBadge updates badge and replaces requirements
20. editBadge returns error when update fails
21. editBadge returns error when requirement reinsertion fails
22. deleteBadge removes badge and requirements
23. deleteBadge returns error when delete fails
Describe: Badge Editor Handlers (safeAction + toasts)
24. handleFetchBadges returns data and no toast
25. handleFetchBadges surfaces error
26. handleAddBadge shows success toast
27. handleAddBadge shows error toast on failure
28. handleEditBadge respects suppressToast
29. handleDeleteBadge returns false on error
30. handleUploadBadgeImage returns url and invalidates cache flag via toast
31. handleUploadBadgeImage returns null on failure
32. handleDeleteBadgeImage returns false on error
</details>

## __tests___/unit/manager/badge-assignment.test.ts
<details>
<summary><strong>TEST COVERAGE FOR BADGE ASSIGNMENT (UNIT)</strong></summary>

Describe: When the manager loads manual badges
1. fetchManualBadges action returns only manual badges from the admin client
2. handleFetchManualBadges handler returns an empty array and shows a toast when the query fails
Describe: When the manager loads badge assignment users
3. fetchBadgeAssignmentUsers action returns users with collected badges and profile URLs
4. handleFetchBadgeAssignmentUsers handler returns an empty array and shows a toast when collected badges fail to load
Describe: When the manager awards a manual badge
5. assignManualBadgeToUser action creates the award, updates user points, and inserts a notification
6. handleAssignManualBadgeToUser handler returns false and shows a toast when the user already has the badge
Describe: When the manager loads badge award debug entries
7. fetchBadgeAwardDebugEntries action returns the normalized debug rows
8. handleFetchBadgeAwardDebugEntries handler returns an empty array and shows a toast when the manager is unauthorized
Describe: When the manager removes a badge award
9. removeBadgeAward action deletes the award and deducts the badge points from the user
10. handleRemoveBadgeAward handler returns false and shows a toast when the delete fails
Describe: When the manager loads the full badge catalog
11. fetchAllBadges action returns both manual and automatic badges
</details>

## __tests___/unit/manager/assigned-tasks.test.ts
<details>
<summary><strong>TEST COVERAGE FOR ASSIGNED TASKS (UNIT)</strong></summary>

Describe: When the manager loads assigned-task data through handlers
1. task-view pagination handler returns assigned-task payload without error toast
2. employee-view pagination handler returns assigned-task payload without error toast
Describe: When the manager clears or deletes assigned tasks through handlers
3. clear-unstarted-by-employee handler returns cleared count and shows success toast
4. delete-task handler returns false and shows an error toast when action fails
</details>

## __tests___/unit/manager/task-verification.test.ts
<details>
<summary><strong>TEST COVERAGE FOR TASK VERIFICATION (UNIT)</strong></summary>

Describe: When the manager loads tasks that need review
1. fetchTasksToReview action returns the in-review tasks from the task view
2. fetchTasksToReviewPaginated action returns paginated data and total pages
3. handleFetchTasksToReview handler returns an empty list and shows a toast when the action fails
Describe: When the manager loads approved or rejected tasks
4. approved and denied task actions return the expected task collections
5. paginated approved and denied task handlers return fallback pagination when the action fails
Describe: When the manager approves a task submission
6. approveTaskAction updates the task, clears pending orders, and creates a notification
7. handleApproveTask handler returns null and shows a toast when the action fails
Describe: When the manager rejects a task submission
8. rejectTaskAction updates the task and creates a rejection notification
9. handleRejectTask handler returns null and shows a toast when the action fails
</details>

## __tests___/unit/hr/hr-leaderboard.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR LEADERBOARD (UNIT)</strong></summary>

Describe: When HR generates leaderboard rankings through the action handler
1. generate handler returns rows when the wrapped server action succeeds
2. generate handler throws when the wrapped server action result contains an error
Describe: When HR toggles leaderboard visibility through the action handler
3. visibility handler returns the updated row when the wrapped action succeeds
4. visibility handler throws when the wrapped action returns missing data
</details>

## __tests___/unit/hr/mercado-items.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR MERCADO ITEMS (UNIT)</strong></summary>

Describe: When HR loads Mercado items
1. getRewardsAction returns transformed items with redeemed counts and stock flags
2. handleGetRewardsAction throws when reward loading fails
Describe: When HR adds and edits Mercado items
3. addRewardAction creates a new item with normalized fields
4. handleAddRewardAction returns the new item and shows a success toast
5. handleAddRewardAction returns null and shows a toast for invalid redeeming limit
6. editRewardAction updates an existing item and preserves the reward record
7. handleEditRewardAction returns the updated item and shows a success toast
8. handleEditRewardAction returns null and shows a toast when validation fails
9. editRewardAction blocks redeeming limit above current quantity when quantity is not included
Describe: When HR updates Mercado item visibility and lifecycle
10. hideRewardAction marks an item as hidden
11. handleHideRewardAction returns true and shows a success toast on unhide
12. deleteRewardAction removes the item and its storage picture
13. handleDeleteRewardAction returns true and shows a success toast
14. handleDeleteRewardAction returns false and shows a toast when delete fails
Describe: When HR uploads Mercado item pictures
15. uploadRewardPicture returns a public URL for a valid image
16. handleUploadRewardPicture rejects oversized images before upload
</details>

## __tests___/unit/hr/rewards-requests.test.ts
<details>
<summary><strong>TEST COVERAGE FOR HR REWARD REQUESTS (UNIT)</strong></summary>

Describe: When HR loads reward requests
1. getRedemptionRequestsAction returns pending requests with transformed fields
2. handleGetRedemptionRequestsAction throws when fetch fails
3. getRedemptionRequestsAction excludes employee-cancelled rows in rejected filter
Describe: When HR accepts a pending request
4. acceptRedemptionRequestAction approves the request, deducts stock, and creates a notification
5. handleAcceptRedemptionRequestAction returns an error payload and shows a toast when the request is already processed
Describe: When HR declines a pending request
6. declineRedemptionRequestAction rejects the request, refunds points, restores stock, and creates a notification
7. handleDeclineRedemptionRequestAction returns success and shows the success toast with remarks
</details>

## __tests___/unit/superadmin/superadmin.test.ts
<details>
<summary><strong>TEST COVERAGE FOR SUPERADMIN USERS (UNIT)</strong></summary>

Describe: fetchUsersAction
1. returns users when fetch succeeds
2. throws when fetch fails
Describe: fetchUsersPaginatedAction
3. returns paginated data on success
4. returns error when fetch rejects
Describe: addUserAction
5. rejects invalid input (email)
6. creates user when backend succeeds
7. returns error when backend returns error
Describe: editUserAction
8. rejects invalid input
9. updates user via rpc when valid
10. changes password before rpc when provided
11. propagates rpc error
Describe: deleteUserAction
12. deletes user and profile picture
13. returns error when profile removal fails
Describe: uploadProfilePicture
14. returns public URL when file exists
15. fails when file missing
Describe: deleteProfilePicture
16. removes picture successfully
17. returns error on storage failure
Describe: API Routes
18. adduser route creates user and writes to memDb
19. adduser route rejects duplicate email
20. changepw route updates password with valid input
21. changepw route rejects short password
22. deluser route deletes existing user
23. deluser route returns error when user missing
24. filter route filters by role and paginates
Describe: Error Handling and Edge Cases
25. adduser route handles malformed JSON
26. addUserAction rejects whitespace-only name via zod
27. editUserAction rejects long address
</details>