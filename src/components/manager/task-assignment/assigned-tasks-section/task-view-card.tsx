'use client';

import { useState, useEffect, memo } from 'react';
import { parseISO, format } from 'date-fns';
import type { AssignedTask, AssignedEmployee } from '@/types';
import { ChevronDown, X } from 'lucide-react';
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
  useEffect(() => {
    handleFetchEmployeeList().then(setEmployees);
  }, []);

  const displayedEmployees = expanded
    ? (task.assignedEmployees ?? [])
    : (task.assignedEmployees ?? []).slice(0, 4);
  const hiddenCount = Math.max(0, (task.assignedEmployees ?? []).length - 4);

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
    <div className="rounded-xl bg-[#FAFAFA] p-4 shadow-sm/25">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 ">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#690003]">{task.taskName}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">{task.taskType}</p>
          <div className="flex gap-6 text-sm text-black">
            <span>
              {formatDate(task.dateRange.start)} - {formatDate(task.dateRange.end)}
            </span>
            <span>Max Orders: {task.maxOrders}</span>
            <span className="flex items-center gap-2">
              <span>{task.points} pts</span>
              <span>XP {task.xp}</span>
            </span>
          </div>
        </div>

        <TaskViewCardMenu
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
          handleOpenEditDialog={handleOpenEditDialog}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      </div>

      {/* Assigned To Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-[#690003]">
            Assigned to{' '}
            <span className="bg-gray-300 text-gray-700 w-7 h-6 px-1 rounded-full text-sm ml-1.5 inline-flex items-center justify-center">
              {(task.assignedEmployees ?? []).length}
            </span>
          </h4>
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
            >
              See All{' '}
              <ChevronDown className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Employee Assigned Badges */}
        <div className="flex flex-wrap gap-3">
          {(displayedEmployees ?? []).map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-gray-300"
            >
              <span className="font-medium text-sm text-black">{emp.name}</span>
              <span className="text-gray-500 font-light text-sm">{emp.empId}</span>
              <button
                onClick={() => setShowRemoveConfirm(emp.id)}
                className="text-gray-400 hover:text-red-500 ml-2 transition-all duration-500 ease-in-out cursor-pointer hover:scale-130"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
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
    </div>
  );
}

export const MemoizedTaskViewCard = memo(TaskViewCard);
