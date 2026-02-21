'use client';

import { TaskStatusBoard } from './task-status-board';
import { Header } from '../header';
import NavSection from '../nav-section';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import HeaderHUD from '../dashboard/header-hud';

export function TasksPage() {
  const { data, error, isLoading } = useGetEmployeeTasks();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen p-8 flex flex-col gap-8">
  //       <div className="flex items-center justify-center flex-1">
  //         <div className="text-lg">Loading tasks...</div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen p-8 flex flex-col gap-8">
  //       <Header
  //         title="Tasks"
  //         description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
  //       />
  //       <div className="flex items-center justify-center flex-1">
  //         <div className="text-lg text-destructive">Error: {error.message}</div>
  //       </div>
  //     </div>
  //   );
  // }

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle,#FFFCF5_0%,#EFC18F_40%,#D68B5C_75%,#60203D_100%)]">

      <header className='fixed z-50 w-screen'>
        <HeaderHUD />
      </header>
      
      {/* <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url('/window.png')` }}
      /> */}
      
      <div className="flex flex-row gap-8 w-full max-w-400 mx-auto z-10">
        {/* Left column: Navigation */}
        {/* <div className="w-30 z-10 shrink-0">
          <NavSection />
        </div> */}

        {/* Right column: Task board */}
        <div className="flex-1 min-w-0 p-4">
          <TaskStatusBoard
            currentTasks={currentTasks}
            inReviewTasks={onReviewTasks}
            verifiedTasks={verifiedTasks}
            rejectedTasks={deniedTasks}
          />
        </div>
      </div>

    </div>
  );
}
