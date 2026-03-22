'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 overflow-x-hidden">
      {/* Header with collapse toggle - only on small screens */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full mb-3 sm:mb-4 md:pointer-events-none"
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <p className="text-h2 font-semibold text-foreground">Search & Filters</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-md bg-accent/75 px-2 py-0.5 text-[13px] text-primary-foreground shadow-sm/25">
            {totalCount}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform md:hidden ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          />
        </div>
      </button>

      {/* Collapsible content - only on small screens */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'hidden md:grid' : 'grid'
        }`}
      >
        {/* Search - Full width on mobile, spans 2 cols on md/lg, spans 2 on xl */}
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <Label htmlFor="search" className="text-meta text-foreground">
            Search by Employee Name
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by employee name"
              className={`text-meta control-h rounded-md border border-zinc-200 bg-card pl-9 pr-8 shadow-sm/25 transition-colors focus:border-accent focus:outline-none ${
                isDebouncing ? 'bg-background/50' : 'bg-white'
              }`}
              value={searchQuery}
              onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground">
              {isDebouncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            </div>
          </div>
        </div>

        {/* Employee Type Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="filter-type"
            className="flex items-center gap-2 text-meta text-foreground"
          >
            <span className="hidden md:inline">Employee Type</span>
            <span className="inline md:hidden">Type</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select
            value={employeeTypeFilter}
            onValueChange={onEmployeeTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="filter-type"
              className={`text-button control-h rounded-md border border-gray-200 bg-card py-1.5 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
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

        {/* Employment Status Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="filter-status"
            className="flex items-center gap-2 text-meta text-foreground"
          >
            <span className="hidden md:inline">Employment Status</span>
            <span className="inline md:hidden">Status</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select
            value={employmentStatusFilter}
            onValueChange={onEmploymentStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="filter-status"
              className={`text-button control-h rounded-md border border-gray-200 bg-card py-1.5 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
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

        {/* Sort - Full width on mobile, spans 2 cols on md/lg, spans 2 on xl/2xl */}
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <Label htmlFor="sort" className="flex items-center gap-2 text-meta text-foreground">
            Sort By
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
            <SelectTrigger
              id="sort"
              className={`text-button control-h rounded-md border border-gray-200 bg-card py-1.5 text-primary shadow-sm/25 transition-all duration-200 ease-in-out hover:bg-gray-200 ${
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
    </section>
  );
}

export function SearchFilterSkeleton() {
  return (
    <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 overflow-x-hidden animate-pulse">
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4 lg:mb-5">
        <div className="h-5 sm:h-6 bg-background rounded w-32 sm:w-40" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-12 rounded-md bg-background" />
          <div className="h-5 w-5 rounded bg-background md:hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <div className="h-4 sm:h-5 bg-background rounded w-28 sm:w-36" />
          <div className="control-skeleton-h bg-background rounded-md w-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 sm:h-5 bg-background rounded w-16 sm:w-24" />
          <div className="control-skeleton-h bg-background rounded-md w-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 sm:h-5 bg-background rounded w-20 sm:w-28" />
          <div className="control-skeleton-h bg-background rounded-md w-full" />
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <div className="h-4 sm:h-5 bg-background rounded w-16 sm:w-20" />
          <div className="control-skeleton-h bg-background rounded-md w-full" />
        </div>
      </div>
    </section>
  );
}
