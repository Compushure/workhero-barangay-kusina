'use client';

import { Task } from "@/types";

interface SelectTasksTableProps {
  filteredTasks: Task[];
  toggleTask: (taskId: string) => void;
  updateMaxAttempts: (taskId: string, newValue: number) => void;
  selectedTasks: string[];
  taskMaxAttempts: Record<string, number>;
  assignedTaskIds: Set<string>;
}

function SelectTasksTable({
  filteredTasks,
  toggleTask,
  updateMaxAttempts,
  selectedTasks,
  taskMaxAttempts,
  assignedTaskIds,
}: SelectTasksTableProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-300 flex-1 flex flex-col overflow-auto">
      <table className="w-full">
        <thead className="bg-[#690003] text-white">
          <tr>
            <th className="w-[5%] py-4"></th>
            <th className="w-[35%] py-4 text-left pl-4 text-sm font-bold">TASK</th>
            <th className="w-[20%] py-4 text-center text-sm font-bold">POINTS</th>
            <th className="w-[15%] py-4 text-center text-sm font-bold">XP</th>
            <th className="w-[25%] py-4 text-center text-sm font-bold">MAX ATTEMPTS</th>
          </tr>
        </thead>
      </table>
      <div className="overflow-y-auto flex flex-col">
        <table className="w-full">
          <tbody>
            {filteredTasks.map((task) => {
              const isSelected = selectedTasks.includes(task.id);
              const currentMaxAttempts =
                taskMaxAttempts[task.id] ?? (task.isRepeatable ? 1 : task.maxAttempts);
              const isAlreadyAssigned = assignedTaskIds.has(task.id);
              const isDisabled = isAlreadyAssigned;

              return (
                <tr
                  key={task.id}
                  className={`border-b border-gray-200 ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) toggleTask(task.id);
                  }}
                >
                  <td className="w-[5%] p-4 text-center">
                    <input
                      type="radio"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) toggleTask(task.id);
                      }}
                      className="w-5 h-5 cursor-pointer accent-[#690003] disabled:cursor-not-allowed"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="w-[35%] px-4 py-3">
                    <div className="font-medium text-gray-800 font-sans">{task.name}</div>
                    <div className="text-sm text-gray-500 font-sans">{task.type}</div>
                  </td>
                  <td className="w-[20%] p-4 text-gray-600 text-center font-sans">
                    {task.points}pts
                  </td>
                  <td className="w-[15%] p-4 text-gray-600 text-center font-sans">{task.xp}</td>
                  <td className="w-[25%] p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      {task.isRepeatable ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxAttempts(task.id, currentMaxAttempts - 1);
                            }}
                            disabled={isDisabled}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={currentMaxAttempts}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateMaxAttempts(task.id, Number.parseInt(e.target.value) || 1);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isDisabled}
                            className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1 font-sans disabled:opacity-50"
                            min="1"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaxAttempts(task.id, currentMaxAttempts + 1);
                            }}
                            disabled={isDisabled}
                            className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-600 font-sans">1</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SelectTasksTable;
