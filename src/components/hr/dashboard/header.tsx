'use client';

import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';
import { PageHeader } from '@/components/shared/page-header';

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
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title={title} subtitle={description} />

      <section className="manager-sticky-controls rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 flex-col items-stretch gap-2 xl:flex-row xl:items-center xl:justify-end">
          <div className="min-w-0 flex-1 xl:max-w-xs">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={(value) => onSearch?.(value)}
              placeholder="Search by employee or item name"
              width="w-full"
            />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap xl:shrink-0">
            {statusFilter && onStatusChange && (
              <SortButton
                sortBy={statusFilter as any}
                onSortChange={(value) => onStatusChange(value as string)}
                options={[
                  { value: 'pending' as any, label: 'Pending' },
                  { value: 'approved' as any, label: 'Approved' },
                  { value: 'rejected' as any, label: 'Rejected' },
                ]}
              />
            )}
            <SortButton
              sortBy={sortBy as any}
              onSortChange={(value) => onSort?.(value)}
              options={[
                { value: 'date-desc' as any, label: 'Date (Newest)' },
                { value: 'date-asc' as any, label: 'Date (Oldest)' },
                { value: 'employee-asc' as any, label: 'Employee (A-Z)' },
                { value: 'employee-desc' as any, label: 'Employee (Z-A)' },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
