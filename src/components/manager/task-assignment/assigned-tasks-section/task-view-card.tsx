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
      className={`relative flex flex-col lg:flex-row items-start lg:items-start justify-between rounded-2xl bg-card p-4 md:p-5 gap-3 sm:gap-4 md:gap-6 transition-all ease-in-out duration-400
        ${expanded ? 'scale-102 shadow-md/25' : 'shadow-sm/25'}`}
    >
      <main className="flex flex-col w-full gap-3 sm:gap-4 md:gap-5 min-w-0 flex-1 pr-6 sm:pr-8 lg:pr-0">
        <section className="flex flex-col lg:flex-row lg:justify-between gap-2 sm:gap-3 min-w-0">
          {/* Task name, description, and date range */}
          <header className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-0.5 sm:gap-0 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-primary truncate shrink-0 max-w-full sm:max-w-125">
                {task.taskName}
              </h3>
              <p className="text-xs text-gray-500 sm:ml-1.5 sm:mr-6 sm:pb-1 truncate min-w-0 flex-1">
                {task.taskDescription}
              </p>
            </div>

            <p className="flex items-center text-2xs sm:text-xs font-medium text-secondary flex-wrap gap-0.5 sm:gap-1">
              <span className="bg-accent-secondary/25 w-fit rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                {formatDate(task.dateRange.start)} - {formatDate(task.dateRange.end)}
              </span>
              {isTaskOverdue(task.dateRange.end) && (
                <span className="bg-red-100 text-red-500 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full">
                  Task is Overdue
                </span>
              )}
            </p>
          </header>

          {/* Task max orders, fiesta points and XP */}
          <div className="flex gap-2 sm:gap-3 text-secondary/85 items-baseline shrink-0 pt-2">
            <div className="flex flex-col items-end">
              <div className="flex text-xs sm:text-sm font-medium items-end gap-0.5">
                <Soup strokeWidth={1.5} className="size-4 sm:size-5 mb-1.5 sm:mb-2.5" />
                <p className="flex flex-col items-center">
                  <span className="inline-block font-semibold pb-0.5 leading-none text-xs sm:text-sm">
                    {task.maxOrders} max order/s
                  </span>
                  <span className="text-[10px] sm:text-2xs font-extralight text-zinc-400 leading-none">
                    per employee
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end gap-1 sm:gap-1.5">
                <p className="flex gap-0.5 items-end text-base sm:text-lg font-medium">
                  <Coins strokeWidth={1.75} className="size-3.5 sm:size-5" />
                  <span className="inline-block font-semibold text-sm sm:text-lg leading-none pb-0.5">
                    {task.points}
                  </span>
                </p>

                <p className="flex gap-1 items-end font-medium pb-0.5">
                  <span className="inline-block italic text-xs sm:text-base leading-none">XP</span>
                  <span className="inline-block font-semibold text-sm sm:text-lg leading-none">
                    {task.xp}
                  </span>
                </p>
              </div>

              <p className="text-[10px] sm:text-2xs font-extralight text-zinc-400 pl-1.5 sm:pl-2">
                per order
              </p>
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

      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:static flex shrink-0 self-start lg:pt-0.5">
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
