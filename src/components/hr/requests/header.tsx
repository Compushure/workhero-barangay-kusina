'use client';

import {
  ArrowUpDown,
  BadgeCheck,
  Clock3,
  ClockArrowDown,
  ClockArrowUp,
  ListTodo,
  Search,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/page-header';

interface HeaderSectionProps {
  title?: string;
  description?: string;
  searchTerm?: string;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
  sortBy?: string;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  requestsCount?: number;
}

export function HeaderSection({ title, description }: HeaderSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title={title ?? ''} subtitle={description} />
    </div>
  );
}

export function RewardRequestsControls({
  searchTerm = '',
  onSearch,
  onSort,
  sortBy = 'date-desc',
  statusFilter,
  onStatusChange,
  requestsCount = 0,
}: HeaderSectionProps) {
  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock3, iconClassName: 'text-accent' },
    { value: 'approved', label: 'Approved', icon: BadgeCheck, iconClassName: 'text-accent' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, iconClassName: 'text-accent' },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First', icon: ClockArrowDown },
    { value: 'date-asc', label: 'Oldest First', icon: ClockArrowUp },
  ];

  const currentStatusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label || 'Pending';
  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label || 'Newest First';

  return (
    <div className="sticky top-(--sticky-top-gap) z-30">
      <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 self-start gap-2 whitespace-nowrap text-h5 text-foreground sm:gap-3 xl:self-center">
          <h5 className="flex items-center gap-1.5 text-h2">
            <ListTodo size={16} className="text-accent" />
            Requests{' '}
            <span className="ml-1 rounded-md bg-accent/75 px-2 py-0.5 text-[13px] text-primary-foreground shadow-sm/25">
              {requestsCount}
            </span>
          </h5>
        </div>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          <div className="min-w-0 flex-1 xl:max-w-md">
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
                    className="text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 sm:w-44 sm:px-3"
                  >
                    <span className="truncate">{currentStatusLabel}</span>
                    <ArrowUpDown size={14} className="text-accent" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    Filter by Status
                  </DropdownMenuLabel>
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      className={`manager-dropdown-item cursor-pointer transition-all duration-300 ease-in-out ${
                        statusFilter === option.value ? 'bg-accent/15 text-foreground' : ''
                      }`}
                    >
                      <option.icon className={`mr-2.5 size-3.5 shrink-0 ${option.iconClassName}`} />
                      <span>{option.label}</span>
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
                  className="text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 sm:w-44 sm:px-3"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  <ArrowUpDown size={14} className="text-accent" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Sort by Date
                </DropdownMenuLabel>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSort?.(option.value)}
                    className={`manager-dropdown-item cursor-pointer transition-all duration-300 ease-in-out ${
                      sortBy === option.value ? 'bg-accent/15 text-foreground' : ''
                    }`}
                  >
                    <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                    <span>{option.label}</span>
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
