'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  type: string;
  points: number;
  xp: number;
  maxRepeats: number;
}

// Mock task data
const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    name: '2024 FS Preparation',
    type: 'Core Deliverables',
    points: 5,
    xp: 25,
    maxRepeats: 1,
  },
  {
    id: 'task2',
    name: '2024 ITR Preparation Completeness',
    type: 'Core Deliverables',
    points: 5,
    xp: 25,
    maxRepeats: 1,
  },
  {
    id: 'task3',
    name: 'Turnaround Completion Time (TAT)',
    type: 'Compliance & Discipline',
    points: 3,
    xp: 25,
    maxRepeats: 1,
  },
  {
    id: 'task4',
    name: 'Zero Compliance Violations',
    type: 'Compliance & Discipline',
    points: 5,
    xp: 25,
    maxRepeats: 1,
  },
  {
    id: 'task5',
    name: 'Advanced Training',
    type: 'Growth & Development',
    points: 5,
    xp: 25,
    maxRepeats: 1,
  },
];

interface SelectTasksDialogProps {
  selectedTasks: string[];
  onTasksChange: (tasks: string[]) => void;
  mode?: 'assign' | 'add-task';
}

export function SelectTasksDialog({
  selectedTasks,
  onTasksChange,
  mode = 'assign',
}: SelectTasksDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [taskMaxRepeats, setTaskMaxRepeats] = useState<Record<string, number>>({});

  const filteredTasks = MOCK_TASKS.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = task.name.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const taskTypes = ['all', ...new Set(MOCK_TASKS.map((t) => t.type))];

  const toggleTask = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      onTasksChange(selectedTasks.filter((id) => id !== taskId));
      const newMaxRepeats = { ...taskMaxRepeats };
      delete newMaxRepeats[taskId];
      setTaskMaxRepeats(newMaxRepeats);
    } else {
      onTasksChange([...selectedTasks, taskId]);
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (task && !taskMaxRepeats[taskId]) {
        setTaskMaxRepeats({ ...taskMaxRepeats, [taskId]: task.maxRepeats });
      }
    }
  };

  const updateMaxRepeats = (taskId: string, newValue: number) => {
    setTaskMaxRepeats({ ...taskMaxRepeats, [taskId]: Math.max(1, newValue) });
  };

  const handleConfirm = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const dialogTitle = mode === 'add-task' ? 'Add Task' : 'Select Tasks';

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <div className="flex items-center gap-2">
          <span>{selectedTasks.length} selected</span>
          <Plus className="w-4 h-4" />
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#FBF4E8] min-w-5/8 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#690003]">{dialogTitle}</DialogTitle>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Task"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
            >
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Tasks Selected Badge */}
          <div>
            <h4 className="text-lg font-bold text-[#690003] mb-3">
              Tasks Selected{' '}
              <span className="bg-gray-200 px-2 py-1 rounded-full text-sm ml-2">
                {selectedTasks.length}
              </span>
            </h4>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-300 flex-1 flex flex-col overflow-auto">
            <table className="w-full">
              <thead className="bg-[#690003] text-white">
                <tr className="flex py-4 text-sm text-center font-bold items-center">
                  <th className="w-[5%]"></th>
                  <th className="w-[40%] text-left pl-1">TASK</th>
                  <th className="w-[20%]">POINTS / INSTANCE</th>
                  <th className="w-[15%]">XP / INSTANCE</th>
                  <th className="w-[20%]">MAX REPEATS</th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto flex-1">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTasks.includes(task.id);
                  const currentMaxRepeats = taskMaxRepeats[task.id] ?? task.maxRepeats;
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-gray-200 hover:bg-gray-50 flex w-full"
                    >
                      <td className="p-4">
                        <div className="w-[5%] flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTask(task.id)}
                            className="w-5 h-5 rounded cursor-pointer accent-[#690003]"
                          />
                        </div>
                      </td>
                      <td className="w-[40%] flex flex-col justify-center">
                        <div className="font-medium text-gray-800">{task.name}</div>
                        <div className="text-sm text-gray-500">{task.type}</div>
                      </td>
                      <td className="w-[20%] p-4 text-gray-600 shrink-0 text-center">
                        {task.points}pts
                      </td>
                      <td className="w-[15%] p-4 text-gray-600 shrink-0 text-center">{task.xp}</td>
                      <td className="w-[20%] p-4 shrink-0 flex justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateMaxRepeats(task.id, currentMaxRepeats - 1)}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000]"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-medium">{currentMaxRepeats}</span>
                          <button
                            onClick={() => updateMaxRepeats(task.id, currentMaxRepeats + 1)}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedTasks.length === 0}
              className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
