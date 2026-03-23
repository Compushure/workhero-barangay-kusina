'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import type { EmployeeTypeValue, EmploymentStatusValue } from '@/types';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  employeeTypeFilter: 'all' | EmployeeTypeValue;
  onEmployeeTypeChange: (value: string) => void;
  employmentStatusFilter: 'all' | EmploymentStatusValue;
  onEmploymentStatusChange: (value: string) => void;
  sortBy: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
  onSortChange: (value: string) => void;
  isDebouncing: boolean;
  isLoading: boolean;
  totalCount: number;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  employeeTypeFilter,
  onEmployeeTypeChange,
  employmentStatusFilter,
  onEmploymentStatusChange,
  sortBy,
  onSortChange,
  isDebouncing,
  isLoading,
  totalCount,
}: SearchFilterProps) {
  return (
    <section className="manager-sticky-controls w-full max-w-5xl lg:max-w-6xl mx-[auto!important] mt-1 sm:mt-1.5 md:mt-2 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-2.5 md:py-3 overflow-hidden rounded-lg">
      <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-fit shrink-0 self-start gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-card/75 px-2.5 py-2 text-meta text-primary shadow-sm/25 md:gap-3 md:px-3 xl:self-center">
          <h5 className="leading-none">
            Employees{' '}
            <span className="ml-0.5 rounded-md bg-accent/75 px-1.5 py-0.5 text-[13px] text-primary-foreground shadow-sm/25 md:px-2">
              {totalCount}
            </span>
          </h5>
        </div>

        <div className="w-full min-w-0 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-end justify-end gap-1.5 whitespace-nowrap sm:gap-2 lg:gap-3">
            <div className="space-y-1.5 min-w-55 sm:min-w-62.5 lg:min-w-75">
              <Label htmlFor="search" className="text-[11px] text-foreground">
                Search by Employee Name
              </Label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 sm:h-3.5 sm:w-3.5" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by employee name"
                  className={`text-meta control-h w-full rounded-md border border-zinc-200 bg-card pl-8 pr-2 shadow-sm/25 transition-all duration-500 ease-in-out focus:border-accent focus:outline-none sm:pr-3 ${
                    isDebouncing ? 'bg-background/50' : 'bg-card'
                  }`}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground">
                  {isDebouncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 min-w-37.5">
              <Label
                htmlFor="filter-type"
                className="flex items-center gap-1.5 text-[11px] text-foreground"
              >
                Employee Type
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select
                value={employeeTypeFilter}
                onValueChange={onEmployeeTypeChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="filter-type"
                  className={`text-meta control-h rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="manager-dropdown-content bg-card">
                  <SelectItem value="all" className="manager-dropdown-item text-meta">
                    All Types
                  </SelectItem>
                  <SelectItem value="manager" className="manager-dropdown-item text-meta">
                    Manager
                  </SelectItem>
                  <SelectItem value="hr" className="manager-dropdown-item text-meta">
                    HR
                  </SelectItem>
                  <SelectItem value="regular" className="manager-dropdown-item text-meta">
                    Regular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 min-w-40">
              <Label
                htmlFor="filter-status"
                className="flex items-center gap-1.5 text-[11px] text-foreground"
              >
                Employment Status
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select
                value={employmentStatusFilter}
                onValueChange={onEmploymentStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="filter-status"
                  className={`text-meta control-h rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="manager-dropdown-content bg-card">
                  <SelectItem value="all" className="manager-dropdown-item text-meta">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="probational" className="manager-dropdown-item text-meta">
                    Probational
                  </SelectItem>
                  <SelectItem value="regular" className="manager-dropdown-item text-meta">
                    Regular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 min-w-46.25">
              <Label
                htmlFor="sort"
                className="flex items-center gap-1.5 text-[11px] text-foreground"
              >
                Sort By
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
                <SelectTrigger
                  id="sort"
                  className={`text-meta control-h rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="manager-dropdown-content bg-card">
                  <SelectItem value="name-asc" className="manager-dropdown-item text-meta">
                    Name (A to Z)
                  </SelectItem>
                  <SelectItem value="name-desc" className="manager-dropdown-item text-meta">
                    Name (Z to A)
                  </SelectItem>
                  <SelectItem value="date-asc" className="manager-dropdown-item text-meta">
                    Date Created (Oldest)
                  </SelectItem>
                  <SelectItem value="date-desc" className="manager-dropdown-item text-meta">
                    Date Created (Newest)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SearchFilterSkeleton() {
  return (
    <section className="manager-sticky-controls w-full max-w-5xl lg:max-w-6xl xl:max-w-6xl mx-[auto!important] mt-1 sm:mt-1.5 md:mt-2 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-2.5 md:py-3 overflow-hidden rounded-xl animate-pulse">
      <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="h-7 w-34 shrink-0 rounded-md bg-background xl:self-center" />

        <div className="w-full min-w-0 overflow-hidden">
          <div className="flex min-w-max items-end justify-end gap-1.5 sm:gap-2 lg:gap-3">
            <div className="space-y-1.5 min-w-55 sm:min-w-62.5 lg:min-w-75">
              <div className="h-3.5 bg-background rounded w-28 sm:w-32" />
              <div className="control-skeleton-h bg-background rounded-md w-full" />
            </div>
            <div className="space-y-1.5 min-w-37.5">
              <div className="h-3.5 bg-background rounded w-20" />
              <div className="control-skeleton-h bg-background rounded-md w-full" />
            </div>
            <div className="space-y-1.5 min-w-40">
              <div className="h-3.5 bg-background rounded w-24" />
              <div className="control-skeleton-h bg-background rounded-md w-full" />
            </div>
            <div className="space-y-1.5 min-w-46.25">
              <div className="h-3.5 bg-background rounded w-14" />
              <div className="control-skeleton-h bg-background rounded-md w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
