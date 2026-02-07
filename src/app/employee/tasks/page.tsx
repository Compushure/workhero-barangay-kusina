import { TaskStatusBoard } from '@/components/employee/task-status';
import { fetchEmployeeTasks } from '@/actions/employee/tasks';

export default async function EmployeeTasksPage() {
  const { error, data } = await fetchEmployeeTasks();

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-destructive mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            View your tasks by status: Current, On Review, Verified, or Denied Approval.
          </p>
        </div>
        <TaskStatusBoard
          currentTasks={currentTasks}
          onReviewTasks={onReviewTasks}
          verifiedTasks={verifiedTasks}
          deniedTasks={deniedTasks}
        />
      </div>
    </div>
  );
}
