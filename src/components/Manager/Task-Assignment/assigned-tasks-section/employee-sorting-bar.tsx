'use client';

interface EmployeeSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function EmployeeSortingBar({ sortBy, onSortChange }: EmployeeSortingBarProps) {
  return (
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      className="px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
    >
      <option value="recently added">Recently Added</option>
      <option value="oldest">Oldest</option>
      <option value="a-z">A-Z (Employee Name)</option>
      <option value="z-a">Z-A (Employee Name)</option>
    </select>
  );
}
