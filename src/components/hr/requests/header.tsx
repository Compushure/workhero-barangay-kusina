'use client';

import { ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Date (Newest)' },
    { value: 'date-asc', label: 'Date (Oldest)' },
    { value: 'employee-asc', label: 'Employee (A-Z)' },
    { value: 'employee-desc', label: 'Employee (Z-A)' },
  ];

  const currentStatusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label || 'Pending';
  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label || 'Date (Newest)';

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title={title} subtitle={description} />

      <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex min-w-0 flex-col items-stretch gap-2 xl:flex-row xl:items-center xl:justify-end">
          <div className="min-w-0 flex-1 xl:max-w-xs">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee or item name"
                value={searchTerm}
                onChange={(event) => onSearch?.(event.target.value)}
                className="text-meta control-h w-full min-w-0 rounded-md border border-zinc-200 bg-card pr-3 pl-9 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap xl:shrink-0">
            {statusFilter && onStatusChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="default"
                    className="text-button control-h w-full justify-between border border-gray-200 bg-card py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-44"
                  >
                    <span className="truncate">{currentStatusLabel}</span>
                    <ArrowUpDown size={14} className="text-accent" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="manager-dropdown-content w-44">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                        statusFilter === option.value ? 'bg-accent/15 text-foreground' : ''
                      }`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="text-button control-h w-full justify-between border border-gray-200 bg-card py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-44"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  <ArrowUpDown size={14} className="text-accent" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="manager-dropdown-content w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSort?.(option.value)}
                    className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                      sortBy === option.value ? 'bg-accent/15 text-foreground' : ''
                    }`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>
    </div>
  );
}
