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
    <div className="rounded-2xl border-2 border-accent-secondary/50 flex-1 flex flex-col overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full">
        <thead className="bg-muted text-primary/50 border-b border-accent-secondary/50">
          <tr className="flex justify-baseline py-2 text-sm font-semibold">
            <th className="w-12"></th>
            <th className="w-75 text-left pl-4">TASK</th>
            <th className="w-35 text-center">POINTS</th>
            <th className="w-35 text-center">XP</th>
            <th className="w-48 text-center">MAX ORDERS</th>
          </tr>
        </thead>
      </table>
      <div className="overflow-y-auto flex flex-col [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`flex justify-baseline border-b border-accent/25 text-primary ${
                    isDisabled
                      ? 'brightness-75 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-accent-secondary/25'
                        : 'bg-background-soft hover:bg-row-hover cursor-pointer transition-all duration-300 ease-in-out'
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
                      className="rounded-full p-2 cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundImage: !!isSelected ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ccircle cx=\'8\' cy=\'8\' r=\'3\'/%3e%3c/svg%3e")' : 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: '1rem'
                      }}
                    />
                  </td>
                  <td className="w-75 px-4 py-3">
                    <div className="font-medium truncate">{task.name}</div>
                    <div className="text-sm text-primary/50 truncate">{task.type}</div>
                  </td>
                  <td className="w-35 group flex gap-2 items-center justify-center px-8 py-4 text-primary/75 font-medium text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Coins strokeWidth={1.75} className="size-6" />
                      {task.points}
                    </div>
                  </td>
                  <td className='w-35 font-medium text-primary/75 text-center flex items-center justify-center px-8 py-4'>
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
                            className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent/50 hover:text-card text-primary size-6 rounded flex items-center justify-center cursor-pointer transition-all duration-400 ease-in-out"

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
                            className="remove-arrow w-12 bg-background-soft text-center border border-accent-secondary/75 rounded px-2 py-1"
                            min="1"
                            max="99"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxOrders(task.id, Math.max(1, Math.min(99, currentMaxOrders + 1)));
                            }}
                            className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent/50 hover:text-card text-primary size-6 rounded flex items-center justify-center cursor-pointer transition-all duration-400 ease-in-out"
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
