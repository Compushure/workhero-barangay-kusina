'use client';

import { useState, memo } from 'react';
import type { AssignedTask, AssignedEmployee } from '@/types';
import EmployeeViewCardMenu from './dialogs/employee-view/employee-view-card-menu';
import ClearAllTasksDialog from './dialogs/employee-view/clear-all-tasks-dialog';
import ClearTaskDialog from './dialogs/employee-view/clear-task-dialog';
import EmployeeViewTaskBadges from './employee-view-task-badges';

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
              <div className="flex flex-col w-[20%] min-w-0">
                <h3 className="text-lg font-bold text-[#690003] wrap-break-word">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.empId}</p>
                {employee.tenure && <p className="text-sm text-gray-500">{employee.tenure}</p>}
              </div>

              {/* Assigned Tasks */}
              <EmployeeViewTaskBadges 
                employee={employee}
                hiddenCount={hiddenCount} 
                isExpanded={isExpanded}
                toggleEmployeeExpand={toggleEmployeeExpand} 
                displayedTasks={displayedTasks}
                formatDate={formatDate} 
                setShowRemoveConfirm={setShowRemoveConfirm}
              />

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
