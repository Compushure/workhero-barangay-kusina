// 'use client';

// import {
//   TaskStatusBoard,
//   currentTasks,
//   onReviewTasks,
//   verifiedTasks,
//   deniedTasks,
// } from '@/components/employee/task-status';

// export default function EmployeeTasksPage() {
//   return (
//     <div className="min-h-screen p-8">
//       <div className="max-w-[1600px] mx-auto w-full">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold">Tasks</h1>
//           <p className="text-muted-foreground mt-1">
//             View your tasks by status: Current, On Review, Verified, or Denied Approval.
//           </p>
//         </div>
//         <TaskStatusBoard
//           currentTasks={currentTasks}
//           onReviewTasks={onReviewTasks}
//           verifiedTasks={verifiedTasks}
//           deniedTasks={deniedTasks}
//         />
//       </div>
//     </div>
//   );
// }


// app/employee/tasks/page.tsx
import { EmployeeTasksMain } from '@/components/employee/task-status/employee-tasks';

export default function EmployeeTasksPage() {
  return <EmployeeTasksMain />;
}

