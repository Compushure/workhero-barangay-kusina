'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Pencil, Check, X } from 'lucide-react';
import { handleUpdateTaskPoints } from '@/action-handlers/manager-assignment';
import { SkeletonRow } from '../../card-skeleton';

interface SelectTasksTableProps {
  isLoading: boolean;
  filteredTasks: Task[];
  toggleTask: (taskId: string) => void;
  updateMaxOrders: (taskId: string, newValue: number) => void;
  selectedTaskInstance: Array<{ id: string; maxOrders: number }>;
  taskMaxOrders: Record<string, number>;
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  disabledTaskIds: Set<string>;
}

function SelectTasksTable({
  isLoading,
  filteredTasks,
  toggleTask,
  updateMaxOrders,
  selectedTaskInstance,
  taskMaxOrders,
  setTasks,
  disabledTaskIds,
}: SelectTasksTableProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingPoints, setEditingPoints] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEditing = (taskId: string, currentPoints: number) => {
    setEditingTaskId(taskId);
    setEditingPoints(currentPoints.toString());
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
    setEditingPoints('');
  };

  const handleSavePoints = async (taskId: string) => {
    const newPoints = Number.parseInt(editingPoints) || 0;

    if (newPoints < 0) {
      return; // Don't allow negative points
    }

    setIsUpdating(true);
    try {
      const success = await handleUpdateTaskPoints(taskId, newPoints);

      if (success) {
        // Close editing mode first
        setEditingTaskId(null);
        setEditingPoints('');

        // Update the parent tasks state immediately for instant UI reflection
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, points: newPoints, xp: newPoints } : task
          )
        );
      } else {
        // If update failed, still close editing mode
        setEditingTaskId(null);
        setEditingPoints('');
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error updating task points:', error);
      setEditingTaskId(null);
      setEditingPoints('');
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-300 flex-1 flex flex-col overflow-auto">
      <table className="w-full">
        <thead className="bg-[#690003] text-white">
          <tr className="flex justify-baseline">
            <th className="w-12 py-4"></th>
            <th className="w-75 py-4 text-left pl-4 text-sm font-bold">TASK</th>
            <th className="w-70 py-4 text-center text-sm font-bold">POINTS & XP</th>
            <th className="w-48 py-4 text-center text-sm font-bold">MAX ORDERS</th>
          </tr>
        </thead>
      </table>
      <div className="overflow-y-auto flex flex-col">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
        <table className="w-full">
          <tbody>
            {filteredTasks.map((task) => {
              const isSelected = selectedTaskInstance.some(
                (instance) => instance.id === task.id
              );
              const currentMaxOrders =
                taskMaxOrders[task.id] ?? (task.isRepeatable ? 1 : task.maxOrders);
              const isDisabled = disabledTaskIds.has(task.id);

              return (
                <tr
                  key={task.id}
                  className={`flex justify-baseline border-b border-gray-200 ${
                    isDisabled
                      ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out'
                  } ${!isDisabled && 'cursor-pointer'}`}
                  onClick={(e) => {
                    if (isDisabled) return;
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                >
                  <td className="w-12 p-4 text-center">
                    <input
                      type="radio"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className="w-5 h-5 cursor-pointer accent-[#690003] disabled:cursor-not-allowed"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="w-75 px-4 py-3">
                    <div className="font-medium text-zinc-800">{task.name}</div>
                    <div className="text-sm text-zinc-500">{task.type}</div>
                  </td>
                  <td className="w-70 group flex gap-2 items-center justify-center px-8 py-4 text-zinc-800 font-medium text-center">
                    {editingTaskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSavePoints(task.id);
                          }}
                          disabled={isUpdating}
                          className="bg-[#690003] text-zinc-50 size-6 rounded flex items-center justify-center hover:bg-green-700 cursor-pointer transition-all duration-300 ease-in-out disabled:opacity-50"
                        >
                          <Check className="size-4" />
                        </button>
                        <input
                          type="number"
                          value={editingPoints}
                          onChange={(e) => setEditingPoints(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="remove-arrow w-16 text-center border border-gray-300 rounded px-2 py-1"
                          min="0"
                          disabled={isUpdating}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEditing();
                          }}
                          disabled={isUpdating}
                          className="bg-[#690003] text-zinc-50 size-6 rounded flex items-center justify-center hover:bg-red-700 cursor-pointer transition-all duration-300 ease-in-out disabled:opacity-50"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pl-5">
                        <span className={`${isDisabled ? 'pr-7' : ''}`}>{task.points}</span>
                        {!isDisabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditing(task.id, task.points);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:text-[#690003]"
                          >
                            <Pencil className="size-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="w-48 p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      {task.isRepeatable ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, Math.max(1, currentMaxOrders - 1));
                            }}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={currentMaxOrders}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, Number.parseInt(e.target.value) || 1);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1"
                            min="1"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, currentMaxOrders + 1);
                            }}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span className="text-black">1</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
          
      </div>
    </div>
  );
}

export default SelectTasksTable;
