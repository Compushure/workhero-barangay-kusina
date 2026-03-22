'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
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
    <section className="manager-sticky-controls static! rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 overflow-hidden">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
          <p className="text-sm font-semibold text-foreground">Search & Filters</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-md bg-accent/75 px-2 py-0.5 text-xs text-primary-foreground shadow-sm/25">
            {totalCount}
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-end gap-2.5 sm:gap-3 lg:gap-3.5 whitespace-nowrap">
          <div className="space-y-1.5 min-w-55 sm:min-w-62.5 lg:min-w-75">
            <Label htmlFor="search" className="text-[11px] text-foreground">
              Search by Employee Name
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by employee name"
                className={`h-8 sm:h-8.5 text-xs rounded-md border border-zinc-200 bg-card pl-8.5 pr-7.5 shadow-sm/25 transition-colors focus:border-accent focus:outline-none ${
                  isDebouncing ? 'bg-background/50' : 'bg-white'
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
                className={`h-8 sm:h-8.5 text-[11px] rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
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
                className={`h-8 sm:h-8.5 text-[11px] rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="probational">Probational</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 min-w-46.25">
            <Label htmlFor="sort" className="flex items-center gap-1.5 text-[11px] text-foreground">
              Sort By
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
              <SelectTrigger
                id="sort"
                className={`h-8 sm:h-8.5 text-[11px] rounded-md border border-gray-200 bg-card px-2.5 py-1 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                <SelectItem value="date-asc">Date Created (Oldest)</SelectItem>
                <SelectItem value="date-desc">Date Created (Newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SearchFilterSkeleton() {
  return (
    <section className="manager-sticky-controls static! rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between w-full mb-2.5">
        <div className="h-4.5 sm:h-5 bg-background rounded w-28 sm:w-36" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-11 rounded-md bg-background" />
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="flex min-w-max items-end gap-2.5 sm:gap-3">
          <div className="space-y-1.5 min-w-55 sm:min-w-62.5 lg:min-w-75">
            <div className="h-3.5 bg-background rounded w-28 sm:w-32" />
            <div className="h-8 sm:h-8.5 bg-background rounded-md w-full" />
          </div>
          <div className="space-y-1.5 min-w-37.5">
            <div className="h-3.5 bg-background rounded w-20" />
            <div className="h-8 sm:h-8.5 bg-background rounded-md w-full" />
          </div>
          <div className="space-y-1.5 min-w-40">
            <div className="h-3.5 bg-background rounded w-24" />
            <div className="h-8 sm:h-8.5 bg-background rounded-md w-full" />
          </div>
          <div className="space-y-1.5 min-w-46.25">
            <div className="h-3.5 bg-background rounded w-14" />
            <div className="h-8 sm:h-8.5 bg-background rounded-md w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
