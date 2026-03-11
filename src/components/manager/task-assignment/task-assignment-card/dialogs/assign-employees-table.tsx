'use client';

import { AssignedEmployee } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignEmployeesTableProps {
  isLoading: boolean;
  allFilteredSelected: boolean;
  handleSelectAll: () => void;
  filteredEmployees: AssignedEmployee[];
  selectedEmployees: AssignedEmployee[];
  toggleEmployee: (employee: AssignedEmployee) => void;
  disabledEmployeeIds?: Set<string>;
}

function AssignEmployeesTable({
  isLoading,
  allFilteredSelected,
  handleSelectAll,
  filteredEmployees,
  selectedEmployees,
  toggleEmployee,
  disabledEmployeeIds = new Set(),
}: AssignEmployeesTableProps) {
  return (
    <div className="rounded-2xl border border-accent/50 flex-1 flex flex-col overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-fixed">
        <thead className="bg-primary-gradient text-primary/75 border-b border-accent/50 sticky top-0 z-10">
          <tr className='text-card'>
            <th className="w-[10%] p-1.5 text-center align-middle">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleSelectAll}
                className="size-4 rounded cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundImage: !!allFilteredSelected
                    ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e\")"
                    : 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '1rem',
                }}
              />
            </th>
            <th className="w-[60%] px-1.5 text-left font-bold text-xs">NAME</th>
            <th className="w-[30%] px-1.5 text-left font-bold text-xs">ID NO.</th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-accent/25">
                <td className="w-[10%] p-3 text-center">
                  <Skeleton className="h-4 w-4 mx-auto bg-background rounded" />
                </td>
                <td className="w-[60%] px-1.5 py-2">
                  <Skeleton className="h-5 w-3/4 bg-background" />
                </td>
                <td className="w-[30%] px-1.5 py-2">
                  <Skeleton className="h-5 w-1/2 bg-background" />
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            {filteredEmployees.map((employee) => {
              const isSelected = selectedEmployees.find((e) => e.id === employee.id);
              const isDisabled = disabledEmployeeIds.has(employee.id);

              return (
                <tr
                  key={employee.id}
                  className={`border-b border-accent/25 transition-all duration-300 ease-in-out ${
                    isDisabled
                      ? 'brightness-75 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-row-hover'
                        : 'bg-background-soft hover:bg-row-hover cursor-pointer transition-all duration-300 ease-in-out'
                  }`}
                  onClick={() => !isDisabled && toggleEmployee(employee)}
                >
                  <td className="w-[12%] p-3 text-center align-middle">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        disabled={isDisabled}
                        onChange={() => !isDisabled && toggleEmployee(employee)}
                        className="size-4 rounded cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundImage: !!isSelected
                            ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e\")"
                            : 'none',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          backgroundSize: '1rem',
                        }}
                      />
                    </div>
                  </td>
                  <td className="w-[58%] min-w-0 px-1.5 py-1.5 font-medium text-gray-800 align-middle truncate text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span>{employee.name}</span>
                      {isDisabled && (
                        <span className="text-2xs font-light text-gray-500">Already assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="w-[30%] px-1.5 py-1.5 text-gray-600 align-middle text-xs">
                    {employee.empId}
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

export default AssignEmployeesTable;
