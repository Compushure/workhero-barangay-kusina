'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { parseISO, format } from 'date-fns';
import type { AssignedTask, AssignedEmployee } from '@/types';
import { Coins, Soup } from 'lucide-react';
import TaskViewCardMenu from './dialogs/task-view/task-view-card-menu';
import EditTaskDialog from './dialogs/task-view/edit-task-dialog';
import DeleteTaskDialog from './dialogs/task-view/delete-task-dialog';
import UnassignEmployeeDialog from './dialogs/task-view/unassign-employee-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import { useUpdateTaskAssignmentMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
import { handleFetchEmployeeList } from '@/action-handlers/manager/assignments';
import TaskViewEmployeeBadges from './task-view-employee-badges';
import { isTaskOverdue } from '@/utils/date-utils';

interface TaskViewCardProps {
  task: AssignedTask;
}

export function TaskViewCard({ task }: TaskViewCardProps) {
  const { editTask } = useTaskAssignment();
  const updateTaskMutation = useUpdateTaskAssignmentMutation();

  const [expanded, setExpanded] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    assignmentId?: string;
    employeeId: string;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editMaxOrders, setEditMaxOrders] = useState(task.maxOrders);
  const [editDueDate, setEditDueDate] = useState<Date>(() =>
    task.dateRange?.end ? parseISO(task.dateRange.end) : new Date()
  );
  const [editAssignedEmployees, setEditAssignedEmployees] = useState<string[]>(
    (task.assignedEmployees ?? []).map((e) => e.id)
  );
  const [openPopover, setOpenPopover] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [hasOverflow, setHasOverflow] = useState(false);
  const badgesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleFetchEmployeeList().then(setEmployees);
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (badgesContainerRef.current) {
        // Temporarily remove the height restriction to check natural overflow
        const originalClasses = badgesContainerRef.current.className;
        badgesContainerRef.current.className = badgesContainerRef.current.className.replace(
          'max-h-12 overflow-hidden',
          ''
        );

        const scrollHeight = badgesContainerRef.current.scrollHeight;
        const clientHeight = badgesContainerRef.current.clientHeight;
        const hasNaturalOverflow = scrollHeight > clientHeight;

        // Restore original classes
        badgesContainerRef.current.className = originalClasses;

        setHasOverflow(hasNaturalOverflow);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (badgesContainerRef.current) {
      resizeObserver.observe(badgesContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [task.assignedEmployees]);

  const displayedEmployees = task.assignedEmployees ?? [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  };

  const handleEditTask = async () => {
    const newEmployees = editAssignedEmployees.map((empId) => {
      const existingEmp = (task.assignedEmployees ?? []).find((e) => e.id === empId);
      if (existingEmp) return existingEmp;

      const backendEmp = employees.find((e) => e.id === empId);
      return {
        id: empId,
        name: backendEmp?.name || 'Unknown',
        empId: backendEmp?.empId || '',
        tenure: backendEmp?.tenure,
        assignedTasks: [],
        completedOrders: 0,
      };
    });

    updateTaskMutation.mutate(
      {
        taskId: task.id,
        maxOrders: editMaxOrders,
        newDueDate: format(editDueDate, 'yyyy-MM-dd'),
        employeeIds: editAssignedEmployees,
      },
      {
        onSuccess: () => {
          editTask(task.id, editMaxOrders, format(editDueDate, 'yyyy-MM-dd'), newEmployees);
          setShowEditDialog(false);
        },
      }
    );
  };

  const handleOpenEditDialog = () => {
    setEditMaxOrders(task.maxOrders);
    setEditDueDate(task.dateRange?.end ? parseISO(task.dateRange.end) : new Date());
    setEditAssignedEmployees((task.assignedEmployees ?? []).map((e) => e.id));
    setShowEditDialog(true);
    setOpenPopover(false);
  };

  const handleCancelEdit = () => {
    setEditMaxOrders(task.maxOrders);
    setEditDueDate(task.dateRange?.end ? parseISO(task.dateRange.end) : new Date());
    setEditAssignedEmployees((task.assignedEmployees ?? []).map((e) => e.id));
    setShowEditDialog(false);
  };

  const toggleEmployee = (empId: string) => {
    setEditAssignedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  return (
    <div
      className={`relative flex flex-col lg:flex-row items-start lg:items-start justify-between rounded-2xl bg-card p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 md:gap-8 transition-all ease-in-out duration-400
        ${expanded ? 'scale-102 shadow-md/25' : 'shadow-sm/25'}`}
    >
      <main className="flex flex-col w-full gap-4 sm:gap-5 md:gap-7 min-w-0 flex-1 pr-8 sm:pr-10 lg:pr-0">
        <section className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Task name, description, and date range */}
          <header className="flex min-w-0 flex-1 flex-col gap-1.5 lg:pr-6">
            <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
              <h3 className="block min-w-0 max-w-full truncate text-lg font-bold text-primary sm:text-xl">
                {task.taskName}
              </h3>
              <p className="block min-w-0 max-w-full truncate text-xs text-gray-500 sm:text-sm">
                {task.taskDescription}
              </p>
            </div>

            <p className="flex items-center text-xs sm:text-sm font-medium text-secondary flex-wrap gap-1 sm:gap-2">
              <span className="bg-accent-secondary/25 w-fit rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm">
                {formatDate(task.dateRange.start)} - {formatDate(task.dateRange.end)}
              </span>
              {isTaskOverdue(task.dateRange.end) && (
                <span className="bg-red-100 text-red-500 text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  Task is Overdue
                </span>
              )}
            </p>
          </header>

          {/* Task max orders, fiesta points and XP */}
          <div className="flex shrink-0 items-baseline gap-3 text-secondary/85 sm:gap-4 lg:max-w-full">
            <div className="flex flex-col items-end">
              <div className="flex text-sm sm:text-base font-medium items-end gap-1">
                <Soup strokeWidth={1.5} className="size-5 sm:size-7 mb-2 sm:mb-3.5" />
                <p className="flex flex-col items-center">
                  <span className="inline-block font-semibold pb-1 leading-none text-xs sm:text-base">
                    {task.maxOrders} max order/s
                  </span>
                  <span className="text-[10px] sm:text-xs font-extralight text-zinc-400 leading-none">
                    per employee
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end gap-1.5 sm:gap-2">
                <p className="flex gap-0.5 sm:gap-1 items-end text-base sm:text-xl font-medium leading-none">
                  <Coins strokeWidth={1.75} className="size-4 sm:size-6" />
                  <span className="inline-block font-semibold pb-0.5 text-sm sm:text-base">{task.points}</span>
                </p>

                <p className="flex gap-1 sm:gap-1.5 items-end font-medium pb-0.5">
                  <span className="inline-block italic text-sm sm:text-lg leading-none">XP</span>
                  <span className="inline-block font-semibold text-base sm:text-xl leading-none">{task.xp}</span>
                </p>
              </div>

              <p className="text-[10px] sm:text-xs font-extralight text-zinc-400 pl-2 sm:pl-3">per order</p>
            </div>
          </div>
        </section>

        {/* Assigned To Section */}
        <TaskViewEmployeeBadges
          task={task}
          hasOverflow={hasOverflow}
          expanded={expanded}
          setExpanded={setExpanded}
          badgesContainerRef={badgesContainerRef}
          displayedEmployees={displayedEmployees}
          setShowRemoveConfirm={setShowRemoveConfirm}
        />
      </main>

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:static flex shrink-0 self-start lg:pt-1">
        <TaskViewCardMenu
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
          handleOpenEditDialog={handleOpenEditDialog}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      </div>

      {/* Unassign Employee Dialog */}
      <UnassignEmployeeDialog
        showRemoveConfirm={showRemoveConfirm}
        setShowRemoveConfirm={setShowRemoveConfirm}
        task={task}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        task={task}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        showEditDialog={showEditDialog}
        handleCancelEdit={handleCancelEdit}
        handleEditTask={handleEditTask}
        isProcessing={updateTaskMutation.isPending}
        task={task}
        editMaxOrders={editMaxOrders}
        setEditMaxOrders={setEditMaxOrders}
        editDueDate={editDueDate}
        setEditDueDate={setEditDueDate}
        editAssignedEmployees={editAssignedEmployees}
        toggleEmployee={toggleEmployee}
      />
    </div>
  );
}

export const MemoizedTaskViewCard = memo(TaskViewCard);
