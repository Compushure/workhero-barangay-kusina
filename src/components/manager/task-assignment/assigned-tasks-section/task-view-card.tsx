'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { parseISO, format } from 'date-fns';
import type { AssignedTask, AssignedEmployee } from '@/types';
import { ChevronDown, Coins, Soup, X } from 'lucide-react';
import TaskViewCardMenu from './dialogs/task-view/task-view-card-menu';
import EditTaskDialog from './dialogs/task-view/edit-task-dialog';
import DeleteTaskDialog from './dialogs/task-view/delete-task-dialog';
import UnassignEmployeeDialog from './dialogs/task-view/unassign-employee-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import { useUpdateTaskAssignmentMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
import { handleFetchEmployeeList } from '@/action-handlers/manager-assignment';

interface TaskViewCardProps {
  task: AssignedTask;
}

export function TaskViewCard({ task }: TaskViewCardProps) {
  const { editTask } = useTaskAssignment();
  const updateTaskMutation = useUpdateTaskAssignmentMutation();

  const [expanded, setExpanded] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editMaxOrders, setEditMaxOrders] = useState(task.maxOrders);
  const [editDueDate, setEditDueDate] = useState<Date>(() => parseISO(task.dateRange.end));
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

  const formatDate = (dateString: string) => {
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
    setEditDueDate(parseISO(task.dateRange.end));
    setEditAssignedEmployees((task.assignedEmployees ?? []).map((e) => e.id));
    setShowEditDialog(true);
    setOpenPopover(false);
  };

  const handleCancelEdit = () => {
    setEditMaxOrders(task.maxOrders);
    setEditDueDate(parseISO(task.dateRange.end));
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
      className={`flex items-center justify-between rounded-2xl bg-[#FAFAFA] p-6 gap-8 transition-all ease-in-out duration-150 ${expanded ? 'scale-102 relative shadow-md/25' : 'shadow-sm/25'}`}
    >
      <main className="flex flex-col w-full gap-5">
        <section className="flex justify-between">
          {/* Task name, description, and date range */}
          <header className="flex flex-col gap-1.5">
            <div className="flex items-end">
              <h3 className="text-xl font-bold text-[#690003] leading-none">{task.taskName}</h3>
              <p className="text-sm text-gray-500 ml-2 leading-none">- {task.taskType}</p>
            </div>

            <span className="text-sm font-medium text-zinc-500">
              {formatDate(task.dateRange.start)} - {formatDate(task.dateRange.end)}
            </span>
          </header>

          {/* Task max orders, fiesta points and XP */}
          <div className="flex gap-4 text-zinc-500 items-baseline">
            
            <div className="flex flex-col items-end">
              <div className="flex text-base font-medium items-end gap-1">
                <Soup strokeWidth={1.5} className="size-7 mb-3.5" />
                <p className='flex flex-col items-center'>
                  <span className="inline-block font-semibold pb-1 leading-none">{task.maxOrders} max order/s</span>
                  <span className="text-xs font-extralight text-zinc-400 leading-none">per employee</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end gap-2">
                <p className="flex gap-1 items-end text-xl font-medium leading-none">
                  <Coins strokeWidth={1.75} className="size-6" />
                  <span className="inline-block font-semibold pb-0.5">{task.points}</span>
                </p>

                <p className="flex gap-1.5 items-end font-medium pb-0.5">
                  <span className="inline-block italic text-lg leading-none">XP</span>
                  <span className="inline-block font-semibold text-xl leading-none">{task.xp}</span>
                </p>
              </div>

              <p className="text-xs font-extralight text-zinc-400 pl-3">per order</p>
            </div>
            
          </div>
        </section>

        {/* Assigned To Section */}
        <section className="">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-[#690003]">
              Assigned to{' '}
              <span className="bg-zinc-200 text-gray-700 shadow w-7 h-6 px-1 rounded-full text-sm ml-1.5 inline-flex items-center justify-center">
                {(task.assignedEmployees ?? []).length}
              </span>
            </h4>
            {(hasOverflow || expanded) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
              >
                {expanded ? 'Show Less' : 'See All'}{' '}
                <ChevronDown className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Employee Assigned Badges */}
          <div
            ref={badgesContainerRef}
            className={`flex flex-wrap gap-3 transition-all duration-300 ${!expanded ? 'max-h-10 overflow-hidden' : ''}`}
          >
            {(displayedEmployees ?? []).map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border-2 border-gray-300"
              >
                <span className="font-medium text-sm text-zinc-700">{emp.name}</span>
                <span className="text-gray-500 font-normal text-xs">{emp.empId}</span>
                <button
                  onClick={() => setShowRemoveConfirm(emp.id)}
                  className="ml-2 transition-all duration-500 ease-in-out cursor-pointer hover:scale-130"
                >
                  <X className="size-3.5 text-[#690003] hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="flex">
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
