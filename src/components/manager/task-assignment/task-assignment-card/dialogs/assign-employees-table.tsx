"use client";

import { AssignedEmployee } from "@/types";

interface AssignEmployeesTableProps {
  allFilteredSelected: boolean,
  handleSelectAll: () => void,
  filteredEmployees: AssignedEmployee[],
  selectedEmployees: AssignedEmployee[],
  toggleEmployee: (employee: AssignedEmployee) => void
}

function AssignEmployeesTable({allFilteredSelected, handleSelectAll, filteredEmployees, selectedEmployees, toggleEmployee} : AssignEmployeesTableProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 flex-1 flex flex-col overflow-auto">
      
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr className="flex py-2 px-2 items-center">
            <th className="p-2 flex w-[10%]">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded cursor-pointer accent-[#690003]"
              />
            </th>
            <th className="w-[60%] px-3 text-left font-bold text-[#690003]">NAME</th>
            <th className="w-[30%] px-5 text-left font-bold text-[#690003]">ID NO.</th>
          </tr>
        </thead>
      </table>

        <div className="overflow-y-auto flex flex-col">
          <table className='w-full'>
            <tbody>
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.find((e) => e.id === employee.id);
                return (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-200 hover:bg-gray-50 flex w-full items-center py-1 cursor-pointer"
                    onClick={() => toggleEmployee(employee)}
                  >
                    <td className="p-4 flex w-[10%]">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleEmployee(employee)}
                          className="w-5 h-5 rounded cursor-pointer accent-[#690003]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td className="flex w-[60%] px-4 font-medium text-gray-800">
                      {employee.name}
                    </td>
                    <td className="flex w-[30%] px-4 text-gray-600">{employee.empId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

    </div>
  );
}

export default AssignEmployeesTable;