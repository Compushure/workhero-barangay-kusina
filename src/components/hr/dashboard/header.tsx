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
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-end gap-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(value) => onSearch?.(value)}
          placeholder="Search by employee or items"
          width="w-[320px]"
        />
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
            { value: 'employee' as any, label: 'Employee Name' },
          ]}
        />
      </div>
    </div>
  );
}
