'use client';

import { SearchBar } from '@/components/Manager/Task-Verification/search-bar';
import { SortButton } from '@/components/Manager/Task-Verification/sort-button';

interface HeaderSectionProps {
  title: string;
  description?: string;
  searchTerm?: string;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
  sortBy?: string;
}

export function HeaderSection({
  title,
  description,
  searchTerm = '',
  onSearch,
  onSort,
  sortBy = 'date-desc',
}: HeaderSectionProps) {
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#5a2a2a]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#7a3d3d]">{description}</p>}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-end gap-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(value) => onSearch?.(value)}
          placeholder="Search by employee or items"
          width="w-[320px]"
        />
        <SortButton
          sortBy={sortBy as any}
          onSortChange={(value) => onSort?.(value)}
          options={[
            { value: 'date-desc' as any, label: 'Date (Newest) - Default' },
            { value: 'date-asc' as any, label: 'Date (Oldest)' },
            { value: 'cost-desc' as any, label: 'Cost (Highest)' },
            { value: 'cost-asc' as any, label: 'Cost (Lowest)' },
            { value: 'employee' as any, label: 'Employee Name' },
          ]}
        />
      </div>
    </div>
  );
}
