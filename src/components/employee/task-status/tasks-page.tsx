'use client';

import { TaskStatusBoard } from './task-status-board';
import NavSection from '../nav-section';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import HeaderHUD from '../widgets/header-hud';

export function TasksPage() {
  const { data, error, isLoading } = useGetEmployeeTasks();

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div className="min-h-screen w-full flex flex-col bg-[radial-gradient(circle,#FFFCF5_0%,#EFC18F_40%,#D68B5C_75%,#60203D_100%)]">

      <header className='fixed z-50 w-screen'>
        <HeaderHUD />
      </header>
      
      <div className="flex flex-row w-full mx-auto p-4">
        <TaskStatusBoard
          currentTasks={currentTasks}
          inReviewTasks={onReviewTasks}
          verifiedTasks={verifiedTasks}
          rejectedTasks={deniedTasks}
        />
      </div>

    </div>
  );
}
