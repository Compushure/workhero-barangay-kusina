'use client';

import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';

interface HeaderSectionProps {
  title: string;
  description?: string;
  searchTerm?: string;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
  sortBy?: string;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
}

export function HeaderSection({
  title,
  description,
  searchTerm = '',
  onSearch,
  onSort,
  sortBy = 'date-desc',
  statusFilter,
  onStatusChange,
}: HeaderSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-end">
        <div className="w-full sm:min-w-0 md:max-w-md lg:max-w-lg sm:flex-initial">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(value) => onSearch?.(value)}
            placeholder="Search by employee name or item name"
            width="w-full"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {/* Status Filter (if provided) */}
          {statusFilter && onStatusChange && (
            <SortButton
              sortBy={statusFilter as any}
              onSortChange={(value) => onStatusChange(value as string)}
              styleVariant="mercado"
              options={[
                { value: 'pending' as any, label: 'Pending Requests' },
                { value: 'approved' as any, label: 'Approved Requests' },
                { value: 'rejected' as any, label: 'Rejected Requests' },
              ]}
            />
          )}
          {/* Sort Dropdown */}
          <SortButton
            sortBy={sortBy as any}
            onSortChange={(value) => onSort?.(value)}
            styleVariant="mercado"
            options={[
              { value: 'date-desc' as any, label: 'Date (Newest) - Default' },
              { value: 'date-asc' as any, label: 'Date (Oldest)' },
              { value: 'employee-asc' as any, label: 'Employee Name (A-Z)' },
              { value: 'employee-desc' as any, label: 'Employee Name (Z-A)' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
