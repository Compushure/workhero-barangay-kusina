'use client';

import { AssignedEmployee } from '@/types';
import { SkeletonRow } from '../../card-skeleton';

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
    <div className="rounded-2xl border border-accent/50 flex-1 flex flex-col overflow-auto">
      <table className="w-full">
        <thead className="bg-primary-gradient text-card border-b border-accent/50">
          <tr className="flex py-2 items-center">
            <th className="w-13 p-2 flex justify-center items-center">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleSelectAll}
                className="size-5 rounded cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundImage: !!allFilteredSelected ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '1rem'
                  }}
              />
            </th>
            <th className="w-67 px-2 text-left font-bold">NAME</th>
            <th className="w-30 px-2 text-left font-bold">ID NO.</th>
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
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.find((e) => e.id === employee.id);
                const isDisabled = disabledEmployeeIds.has(employee.id);

                return (
                  <tr
                    key={employee.id}
                    className={`flex w-full items-center py-1 transition-all duration-300 ease-in-out border-b border-accent/25 ${
                      isDisabled
                        ? 'brightness-75 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-row-hover'
                        : 'bg-card hover:bg-row-hover cursor-pointer transition-all duration-300 ease-in-out'
                    }`}
                    onClick={() => !isDisabled && toggleEmployee(employee)}
                  >
                    <td className="p-4 flex w-13">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && toggleEmployee(employee)}
                          className="size-5 rounded cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundImage: !!isSelected ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: '1rem'
                          }}
                        />
                      </div>
                    </td>
                    <td className="flex flex-col w-67 px-2 font-medium text-gray-800">
                      <span>{employee.name}</span>
                      {isDisabled && (
                        <span className="text-xs font-light text-gray-500">Already assigned</span>
                      )}
                    </td>
                    <td className="flex w-30 px-2 text-gray-600">{employee.empId}</td>
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

export default AssignEmployeesTable;
