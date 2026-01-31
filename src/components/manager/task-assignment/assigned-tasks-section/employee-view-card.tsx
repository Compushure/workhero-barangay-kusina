'use client';

import { useState, memo } from 'react';
import type { AssignedTask, AssignedEmployee } from '@/types';
import { ChevronDown, CircleDashed, Coins, Soup, X } from 'lucide-react';
import EmployeeViewCardMenu from './dialogs/employee-view/employee-view-card-menu';
import ClearAllTasksDialog from './dialogs/employee-view/clear-all-tasks-dialog';
import ClearTaskDialog from './dialogs/employee-view/clear-task-dialog';

interface EmployeeViewCardProps {
  tasks: AssignedTask[];
  searchTerm?: string;
  sortBy: string;
}

export function EmployeeViewCard({ tasks, searchTerm = '', sortBy }: EmployeeViewCardProps) {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    taskId: string;
    empId: string;
  } | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);

  // ✅ Build employee map safely
  const employeeMap = new Map<string, AssignedEmployee>();
  (tasks ?? []).forEach((task) => {
    (task.assignedEmployees ?? []).forEach((emp) => {
      if (!employeeMap.has(emp.id)) {
        employeeMap.set(emp.id, { ...emp, assignedTasks: [] });
      }
      const employee = employeeMap.get(emp.id);
      if (employee) {
        employee.assignedTasks.push(task);
      }
    });
  });

  const employees = Array.from(employeeMap.values());

  // Remove client-side sorting since it's handled server-side

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No employees found.</p>
      </div>
    );
  }

  const toggleEmployeeExpand = (empId: string) => {
    const newSet = new Set(expandedEmployees);
    if (newSet.has(empId)) {
      newSet.delete(empId);
    } else {
      newSet.add(empId);
    }
    setExpandedEmployees(newSet);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  };

  return (
    <div className="space-y-4">
      {employees.map((employee) => {
        const isExpanded = expandedEmployees.has(employee.id);
        const displayedTasks = isExpanded
          ? employee.assignedTasks
          : employee.assignedTasks.slice(0, 2);
        const hiddenCount = Math.max(0, employee.assignedTasks.length - 2);

        return (
          <div className={`flex w-full items-start justify-between rounded-2xl bg-[#FAFAFA] p-6 transition-all ease-in-out duration-150 
          ${isExpanded ? 'scale-102 relative shadow-md/25' : 'shadow-sm/25'}`} key={employee.id}>
              {/* Employee Details */}
              <div className="flex flex-col w-[20%]">
                <h3 className="text-lg font-bold text-[#690003] wrap-break-word">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.empId}</p>
                {employee.tenure && <p className="text-sm text-gray-500">{employee.tenure}</p>}
              </div>

              {/* Assigned Tasks */}
              <div className="flex flex-col pl-4 pr-2 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-[#690003]">
                    Current Tasks{' '}
                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-sm ml-2">
                      {employee.assignedTasks.length}
                    </span>
                  </h4>
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => toggleEmployeeExpand(employee.id)}
                      className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
                    >
                      {isExpanded ? 'Show Less' : 'See All'}{' '}
                      <ChevronDown
                        className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Task Badges */}
                <div className="grid grid-cols-2 gap-3">
                  {displayedTasks.map((task: AssignedTask) => {
                    const taskEmployee = task.assignedEmployees?.find(
                      (emp) => emp.id === employee.id
                    );
                    const completedOrders = taskEmployee?.completedOrders || 0;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border-2 border-gray-300 h-full"
                      >
                        <div className="flex flex-col w-[65%] gap-1">
                            <span className='truncate text-zinc-700 text-sm font-semibold'>
                              {task.taskName}
                            </span>

                            <div className='flex gap-3'>
                              <span className='flex text-zinc-500 text-sm leading-none items-end'>
                                <Soup strokeWidth={1.75} className="size-5 mr-1" />
                                {completedOrders} / {task.maxOrders}
                              </span>

                              <div className="flex items-end gap-1 text-zinc-500">
                                <p className="flex gap-1 items-end font-semibold text-sm leading-none">
                                  <Coins strokeWidth={2.5} className="size-4" />
                                  <span className="inline-block">{task.points}</span>
                                </p>

                                <p className="flex gap-1.5 items-end">
                                  <span className="inline-block italic font-normal text-sm leading-none">XP</span>
                                  <span className="inline-block font-semibold text-sm leading-none">{task.xp}</span>
                                </p>
                              </div>
                            </div>
                        </div>

                        <div className='flex flex-col w-[30%] items-end pr-3 gap-2'>
                          <p className="text-xs text-gray-500">
                            {formatDate(task.dateRange.end)}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setShowRemoveConfirm({ taskId: task.id, empId: employee.id })
                          }
                          className="hover:scale-130 transition-all duration-500 ease-in-out cursor-pointer"
                        >
                          <X className="size-4 text-[#690003] hover:text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clear All Assigned Tasks for Employee */}
              <div className='flex w-fit justify-center'>
                <EmployeeViewCardMenu
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                  employee={employee}
                  setShowClearConfirm={setShowClearConfirm}
                />
              </div>

            {/* Unassign Task Dialog */}
            <ClearTaskDialog
              showRemoveConfirm={showRemoveConfirm}
              setShowRemoveConfirm={setShowRemoveConfirm}
              employee={employee}
            />

            {/* Unassign All Tasks Dialog */}
            <ClearAllTasksDialog
              showClearConfirm={showClearConfirm}
              setShowClearConfirm={setShowClearConfirm}
              employee={employee}
            />
          </div>
        );
      })}
    </div>
  );
}

export const MemoizedEmployeeViewCard = memo(EmployeeViewCard);
