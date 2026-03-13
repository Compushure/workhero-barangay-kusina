'use client';

import { useEffect, useState, memo } from 'react';
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
  const [firstRowCapacity, setFirstRowCapacity] = useState(1);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    taskId?: string;
    assignmentId?: string;
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

  useEffect(() => {
    const updateFirstRowCapacity = () => {
      if (window.innerWidth >= 1536) {
        setFirstRowCapacity(3);
      } else if (window.innerWidth >= 1280) {
        setFirstRowCapacity(2);
      } else {
        setFirstRowCapacity(1);
      }
    };

    updateFirstRowCapacity();
    window.addEventListener('resize', updateFirstRowCapacity);

    return () => {
      window.removeEventListener('resize', updateFirstRowCapacity);
    };
  }, []);

  useEffect(() => {
    if (showClearConfirm && !employees.some((emp) => emp.id === showClearConfirm)) {
      setShowClearConfirm(null);
    }

    if (showRemoveConfirm && !employees.some((emp) => emp.id === showRemoveConfirm.empId)) {
      setShowRemoveConfirm(null);
    }
  }, [employees, showClearConfirm, showRemoveConfirm]);

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

  const formatDate = (dateString: string | null) => {
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
    <div className="space-y-2">
      {employees.map((employee) => {
        const isExpanded = expandedEmployees.has(employee.id);
        const displayedTasks = isExpanded
          ? employee.assignedTasks
          : employee.assignedTasks.slice(0, firstRowCapacity);
        const hiddenCount = Math.max(0, employee.assignedTasks.length - firstRowCapacity);

        return (
          <div
            className={`relative flex flex-col lg:flex-row w-full items-start lg:justify-between rounded-lg bg-[#FAFAFA] p-3 sm:p-4 gap-2 sm:gap-3 transition-all ease-in-out duration-400 
          ${isExpanded ? 'scale-102 shadow-md/25' : 'shadow-sm/25'}`}
            key={employee.id}
          >
            {/* Employee Details + Menu */}
            <div className="flex items-start justify-between w-full lg:w-auto lg:min-w-50 lg:max-w-60 shrink-0 pr-0 lg:pr-3">
              <div className="flex flex-col min-w-0">
                <h3 className="text-task-title text-foreground wrap-break-word">{employee.name}</h3>
                <p className="text-meta text-gray-600">{employee.empId}</p>
                {employee.tenure && <p className="text-meta text-gray-500">{employee.tenure}</p>}
              </div>

              {/* Triple dots menu - single instance for all breakpoints */}
              <div className="flex relative z-50 lg:absolute lg:top-4 lg:right-4">
                <EmployeeViewCardMenu
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                  employee={employee}
                  setShowClearConfirm={setShowClearConfirm}
                />
              </div>
            </div>

            {/* Assigned Tasks - takes remaining space */}
            <EmployeeViewTaskBadges
              employee={employee}
              hiddenCount={hiddenCount}
              isExpanded={isExpanded}
              toggleEmployeeExpand={toggleEmployeeExpand}
              displayedTasks={displayedTasks}
              formatDate={formatDate}
              setShowRemoveConfirm={setShowRemoveConfirm}
            />
          </div>
        );
      })}

      {/* Dialogs rendered ONCE outside the map - shared across all employees */}
      {/* Always render, let the Dialog's open prop control visibility */}
      <ClearTaskDialog
        showRemoveConfirm={showRemoveConfirm}
        setShowRemoveConfirm={setShowRemoveConfirm}
        employee={
          employees.find((emp) => emp.id === showRemoveConfirm?.empId) || {
            id: '',
            name: '',
            empId: '',
            assignedTasks: [],
            completedOrders: 0,
          }
        }
      />

      <ClearAllTasksDialog
        showClearConfirm={showClearConfirm}
        setShowClearConfirm={setShowClearConfirm}
        employee={
          employees.find((emp) => emp.id === showClearConfirm) || {
            id: '',
            name: '',
            empId: '',
            assignedTasks: [],
            completedOrders: 0,
          }
        }
      />
    </div>
  );
}

export const MemoizedEmployeeViewCard = memo(EmployeeViewCard);
