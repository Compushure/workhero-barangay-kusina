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
}: SearchFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="rounded-3xl bg-background p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25 overflow-x-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full mb-3 sm:mb-4 lg:mb-5 md:pointer-events-none"
        type="button"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <p className="text-sm lg:text-base font-semibold text-foreground">Search & Filters</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform md:hidden ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      {/* Content */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'hidden md:grid' : 'grid'
        }`}
      >
        {/* Search */}
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <Label htmlFor="search" className="text-xs sm:text-sm lg:text-base text-foreground">
            Employee Name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              id="search"
              placeholder="Search by employee name"
              className={`pl-10 pr-9 border-border focus:border-accent focus:ring-accent text-sm sm:text-base lg:text-lg ${
                isDebouncing ? 'bg-background/50' : 'bg-white'
              }`}
              value={searchQuery}
              onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600">
              {isDebouncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            </div>
          </div>
        </div>

        {/* Employee Type Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="filter-type"
            className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-foreground"
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
              className={`bg-card hover:bg-gray-200 rounded-md text-primary w-30 sm:flex-1 sm:min-w-[152px] 
              control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
              focus:outline-none focus:ring-0 focus:border-transparent
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
              <SelectItem
                value="all"
                className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground"
              >
                All Types
              </SelectItem>
              <SelectItem
                value="manager"
                className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground"
              >
                Manager
              </SelectItem>
              <SelectItem
                value="hr"
                className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground"
              >
                HR
              </SelectItem>
              <SelectItem
                value="regular"
                className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground"
              >
                Regular
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employment Status Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="filter-status"
            className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-foreground"
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
              className={`bg-card hover:bg-gray-200 rounded-md text-primary w-30 sm:flex-1 sm:min-w-[152px] 
              control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
              focus:outline-none focus:ring-0 focus:border-transparent
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
              <SelectItem value="all" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                All Statuses
              </SelectItem>
              <SelectItem value="probational" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Probational
              </SelectItem>
              <SelectItem value="regular" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Regular
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <Label
            htmlFor="sort"
            className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-foreground"
          >
            Sort By
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
            <SelectTrigger
              id="sort"
              className={`bg-card hover:bg-gray-200 rounded-md text-primary w-30 sm:flex-1 sm:min-w-[152px] 
              control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
              focus:outline-none focus:ring-0 focus:border-transparent
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <SelectValue placeholder="Select Sort" />
            </SelectTrigger>
            <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
              <SelectItem value="name-asc" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Name (A to Z)
              </SelectItem>
              <SelectItem value="name-desc" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Name (Z to A)
              </SelectItem>
              <SelectItem value="date-asc" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Date Created (Oldest)
              </SelectItem>
              <SelectItem value="date-desc" className="manager-dropdown-item cursor-pointer transition-all duration-400 ease-in-out 
                hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-foreground
                data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-foreground">
                Date Created (Newest)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function SearchFilterSkeleton() {
  return (
    <div className="rounded-3xl bg-background p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25 overflow-x-hidden animate-pulse">
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4 lg:mb-5">
        <div className="h-5 sm:h-6 bg-background rounded w-32 sm:w-40" />
        <div className="h-5 w-5 rounded bg-background md:hidden" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <div className="h-4 sm:h-5 bg-background rounded w-28 sm:w-36" />
          <div className="h-10 sm:h-11 lg:h-12 bg-background rounded-xl w-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 sm:h-5 bg-background rounded w-16 sm:w-24" />
          <div className="h-10 sm:h-11 lg:h-12 bg-background rounded-xl w-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 sm:h-5 bg-background rounded w-20 sm:w-28" />
          <div className="h-10 sm:h-11 lg:h-12 bg-background rounded-xl w-full" />
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <div className="h-4 sm:h-5 bg-background rounded w-16 sm:w-20" />
          <div className="h-10 sm:h-11 lg:h-12 bg-background rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
