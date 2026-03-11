'use client';

import { Task } from '@/types';
import { Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
      <table className="w-full table-fixed">
        <thead className="bg-primary-gradient text-card border-b border-accent-secondary/50 sticky top-0 z-10">
          <tr className="text-xs font-semibold">
            <th className="w-[8%] sm:w-[5%] py-1.5"></th>
            <th className="w-[52%] sm:w-[35%] text-left pl-3 py-1.5">TASK</th>
            <th className="hidden sm:table-cell w-[17%] text-center py-1.5">POINTS</th>
            <th className="hidden sm:table-cell w-[17%] text-center py-1.5">XP</th>
            <th className="w-[40%] sm:w-[26%] text-center py-1.5">MAX ORDERS</th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-accent/25">
                <td className="w-[8%] sm:w-[5%] p-3"></td>
                <td className="w-[52%] sm:w-[35%] px-3 py-2">
                  <Skeleton className="h-6 w-full bg-background" />
                </td>
                <td className="hidden sm:table-cell w-[17%] py-3 text-center">
                  <Skeleton className="h-5 w-10 mx-auto bg-background" />
                </td>
                <td className="hidden sm:table-cell w-[17%] py-3 text-center">
                  <Skeleton className="h-5 w-10 mx-auto bg-background" />
                </td>
                <td className="w-[40%] sm:w-[26%] p-3 text-center">
                  <Skeleton className="h-6 w-16 mx-auto bg-background" />
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            {filteredTasks.map((task) => {
              const isSelected = selectedTaskInstance.some((instance) => instance.id === task.id);
              const currentMaxOrders =
                taskMaxOrders[task.id] ?? (task.isRepeatable ? 1 : task.maxOrders);
              const isDisabled = disabledTaskIds.has(task.id);

              return (
                <tr
                  key={task.id}
                  className={`border-b border-accent/25 text-primary ${
                    isDisabled
                      ? 'brightness-75 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-accent-secondary/25'
                        : 'bg-card hover:bg-row-hover cursor-pointer transition-all duration-300 ease-in-out'
                  } ${!isDisabled && 'cursor-pointer'}`}
                  onClick={(e) => {
                    if (isDisabled) return;
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                >
                  <td className="w-[8%] sm:w-[5%] p-3 text-center align-middle">
                    <input
                      type="radio"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className="rounded-full p-1.5 cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundImage: !!isSelected
                          ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\")"
                          : 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: '1rem',
                      }}
                    />
                  </td>
                  <td className="w-[52%] sm:w-[37%] min-w-0 px-3 py-2 align-middle">
                    <div className="font-medium truncate text-sm">{task.name}</div>
                    <div className="text-xs text-primary/50 truncate">{task.type}</div>
                  </td>
                  <td className="hidden sm:table-cell w-[16%] group py-3 text-primary/75 font-medium text-center align-middle text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <Coins strokeWidth={1.75} className="size-5" />
                      {task.points}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell w-[16%] font-medium text-primary/75 text-center align-middle py-3 text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-block italic text-sm leading-none">XP</span>
                      {task.xp}
                    </div>
                  </td>
                  <td
                    className="w-[26%] p-3 text-center align-middle text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.isRepeatable ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMaxOrders(
                              task.id,
                              Math.max(1, Math.min(99, currentMaxOrders - 1))
                            );
                          }}
                          className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent/50 hover:text-card text-primary size-5 rounded flex items-center justify-center cursor-pointer transition-all duration-400 ease-in-out text-xs"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={currentMaxOrders}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = Math.max(
                              1,
                              Math.min(99, Number.parseInt(e.target.value) || 1)
                            );
                            updateMaxOrders(task.id, value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="remove-arrow w-10 bg-background-soft text-center border border-accent-secondary/75 rounded px-1.5 py-1 text-xs"
                          min="1"
                          max="99"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMaxOrders(
                              task.id,
                              Math.max(1, Math.min(99, currentMaxOrders + 1))
                            );
                          }}
                          className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent/50 hover:text-card text-primary size-5 rounded flex items-center justify-center cursor-pointer transition-all duration-400 ease-in-out text-xs"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-800 text-sm">1</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
    </div>
  );
}

export default SelectTasksTable;
