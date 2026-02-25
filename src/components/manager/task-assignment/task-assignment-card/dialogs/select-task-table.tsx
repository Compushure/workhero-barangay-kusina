'use client';

import { Task } from '@/types';
import { Coins } from 'lucide-react';
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
  disabledTaskIds,
}: SelectTasksTableProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-300 flex-1 flex flex-col overflow-auto">
      <table className="w-full">
        <thead className="bg-[#690003] text-white">
          <tr className="flex justify-baseline">
            <th className="w-12 py-4"></th>
            <th className="w-75 py-4 text-left pl-4 text-sm font-bold">TASK</th>
            <th className="w-35 py-4 text-center text-sm font-bold">POINTS</th>
            <th className="w-35 py-4 text-center text-sm font-bold">XP</th>
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
                  <td className="w-12 p-4 text-center flex items-center">
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
                  <td className="w-35 group flex gap-2 items-center justify-center px-8 py-4 text-zinc-800 font-medium text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Coins strokeWidth={1.75} className="size-6" />
                      {task.points}
                    </div>
                  </td>
                  <td className='w-35 font-medium text-zinc-800 text-center flex items-center justify-center px-8 py-4'>
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block italic text-base leading-none">XP</span>
                      {task.xp}
                    </div>
                  </td>
                  <td className="w-48 p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      {task.isRepeatable ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, Math.max(1, Math.min(99, currentMaxOrders - 1)));
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
                              const value = Math.max(1, Math.min(99, Number.parseInt(e.target.value) || 1));
                              updateMaxOrders(task.id, value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1"
                            min="1"
                            max="99"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, Math.max(1, Math.min(99, currentMaxOrders + 1)));
                            }}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-800">1</span>
                      )}
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
