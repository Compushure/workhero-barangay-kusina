'use client';

import { Coins, MoreVertical, ChevronDown, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    category: string;
    dateRange: string;
    coins: number;
    xp: number;
    assignedCount: number;
    employees: string[];
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function TaskCard({ task, isExpanded, onToggleExpand }: TaskCardProps) {
  const visibleEmployees = task.employees.slice(0, 4);
  const hiddenCount = task.employees.length - 4;

  return (
    <div
      className={`rounded-2xl bg-[#FAFAFA] p-6 shadow-sm/25 transition-all duration-300 ${isExpanded ? 'min-h-auto' : ''}`}
    >
      {/* Header Row */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#690003]">{task.title}</h3>
          <p className="text-sm text-gray-500">({task.category})</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Coins and XP */}
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-gray-600" />
            <span className="font-semibold">{task.coins}</span>
            <span className="italic text-gray-600">XP {task.xp}</span>
          </div>
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={20} className="text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Task</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Date Range */}
      <p className="mb-4 text-sm text-gray-600">{task.dateRange}</p>

      {/* Assigned To Section */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#690003]">Assigned to</span>
        <span className="bg-[#F2F2F2] rounded-full shadow-xs/25 text-sm px-2 font-semibold text-gray-600">
          {task.assignedCount}
        </span>
        <Button
          variant="link"
          onClick={onToggleExpand}
          className="p-0 text-sm font-semibold text-[#690003] underline hover:no-underline"
        >
          See All
          <ChevronDown size={16} className="ml-1" />
        </Button>
      </div>

      {/* Employee Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleEmployees.map((employee) => (
          <div
            key={employee}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
          >
            <span className="text-sm text-gray-700">{employee}</span>
            <span className="text-xs text-gray-500">19-0347-79</span>
            <X size={14} className="ml-1 cursor-pointer text-gray-400" />
          </div>
        ))}

        {/* Show remaining count if collapsed */}
        {!isExpanded && hiddenCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1">
            <span className="text-sm text-gray-700">+{hiddenCount}</span>
          </div>
        )}
      </div>

      {/* Expanded View - Show All Employees */}
      {isExpanded && hiddenCount > 0 && (
        <div className="">
          <div className="flex flex-wrap gap-2 mt-2">
            {task.employees.slice(4).map((employee) => (
              <div
                key={employee}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
              >
                <span className="text-sm text-gray-700">{employee}</span>
                <span className="text-xs text-gray-500">19-0347-79</span>
                <X size={14} className="ml-1 cursor-pointer text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
