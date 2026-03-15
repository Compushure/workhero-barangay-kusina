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
    <div className="rounded-2xl bg-background-soft p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 shadow-sm/25 overflow-x-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full mb-3 sm:mb-4 lg:mb-5 md:pointer-events-none"
        type="button"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent-secondary" />
          <p className="text-sm lg:text-lg font-semibold text-foreground">Search & Filters</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform md:hidden ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      {/* Content: single row layout */}
      <div
        className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'hidden md:flex' : ''}`}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2 sm:gap-3 lg:gap-4 w-full">
          {/* Search (longer) */}
          <div className="flex-1 min-w-0">
            <Label htmlFor="search" className="flex items-center text-meta mb-1">
              Employee Name
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by employee name"
                className={`bg-card border border-border rounded-md control-h pl-10 pr-9 text-primary 
                  shadow-sm/50 transition-all duration-500 ease-in-out 
                  focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-border
                  text-sm sm:text-base lg:text-base placeholder:text-sm placeholder:text-gray-400
                  ${isDebouncing ? 'bg-background/50' : 'bg-white'}`}
                value={searchQuery}
                onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
                {isDebouncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              </div>
            </div>
          </div>
          {/* Employee Type Filter (smaller) */}
          <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
            <Label htmlFor="filter-type" className="flex items-center gap-2 text-meta mb-1">
              <span className="hidden md:inline">Employee Type</span>
              <span className="inline md:hidden">Type</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600 text-meta" />}
            </Label>
            <Select
              value={employeeTypeFilter}
              onValueChange={onEmployeeTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger
                id="filter-type"
                className={`bg-card hover:bg-gray-200 rounded-md text-meta w-full 
                control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
                focus:outline-none focus:ring-0 focus:border-transparent
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <SelectValue className="text-meta" placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
                <SelectItem
                  value="all"
                  className="manager-dropdown-item cursor-pointer text-meta transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  All Types
                </SelectItem>
                <SelectItem
                  value="manager"
                  className="manager-dropdown-item cursor-pointer text-meta transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Manager
                </SelectItem>
                <SelectItem
                  value="hr"
                  className="manager-dropdown-item cursor-pointer text-meta transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  HR
                </SelectItem>
                <SelectItem
                  value="regular"
                  className="manager-dropdown-item cursor-pointer text-meta transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Regular
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Employment Status Filter (smaller) */}
          <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
            <Label
              htmlFor="filter-status"
              className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-meta mb-1"
            >
              <span className="hidden md:inline">Employment Status</span>
              <span className="inline md:hidden">Status</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600 text-meta" />}
            </Label>
            <Select
              value={employmentStatusFilter}
              onValueChange={onEmploymentStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger
                id="filter-status"
                className={`bg-card hover:bg-gray-200 rounded-md text-meta w-full 
                control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
                focus:outline-none focus:ring-0 focus:border-transparent
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <SelectValue className="text-meta" placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
                <SelectItem
                  value="all"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  All Statuses
                </SelectItem>
                <SelectItem
                  value="probational"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Probational
                </SelectItem>
                <SelectItem
                  value="regular"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Regular
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Sort (smaller) */}
          <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
            <Label
              htmlFor="sort"
              className="flex items-center gap-2 text-xs sm:text-sm lg:text-base font-semibold text-meta mb-1"
            >
              Sort By
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600 text-meta" />}
            </Label>
            <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
              <SelectTrigger
                id="sort"
                className={`bg-card hover:bg-gray-200 rounded-md text-meta w-full 
                control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3
                focus:outline-none focus:ring-0 focus:border-transparent
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="truncate">
                  <SelectValue className="text-meta" placeholder="Select Sort" />
                </span>
              </SelectTrigger>
              <SelectContent className="manager-dropdown-content rounded-lg shadow-md">
                <SelectItem
                  value="date-desc"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Date Created (Newest)
                </SelectItem>
                <SelectItem
                  value="date-asc"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Date Created (Oldest)
                </SelectItem>
                <SelectItem
                  value="name-asc"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Name (A to Z)
                </SelectItem>
                <SelectItem
                  value="name-desc"
                  className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out 
                  hover:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-meta
                  data-[state=checked]:[background:color-mix(in_oklab,var(--accent)_16%,transparent)] data-[state=checked]:text-meta"
                >
                  Name (Z to A)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchFilterSkeleton() {
  return (
    <div className="rounded-2xl bg-primary-gradient p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 shadow-sm/25 overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4 lg:mb-5">
        <div className="h-5 w-32 sm:w-40 bg-background rounded" />
        <div className="h-5 w-5 rounded bg-background md:hidden" />
      </div>
      {/* Single row skeleton layout */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2 sm:gap-3 lg:gap-4 w-full">
        {/* Search skeleton (longer) */}
        <div className="flex-1 min-w-0">
          <div className="h-4 w-24 bg-background rounded mb-1" />
          <div className="h-10 bg-background rounded-md w-full" />
        </div>
        {/* Employee Type Filter skeleton */}
        <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
          <div className="h-4 w-20 bg-background rounded mb-1" />
          <div className="h-10 bg-background rounded-md w-full" />
        </div>
        {/* Employment Status Filter skeleton */}
        <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
          <div className="h-4 w-20 bg-background rounded mb-1" />
          <div className="h-10 bg-background rounded-md w-full" />
        </div>
        {/* Sort skeleton */}
        <div className="w-full md:w-30 sm:md:w-35 lg:md:w-40 shrink-0">
          <div className="h-4 w-16 bg-background rounded mb-1" />
          <div className="h-10 bg-background rounded-md w-full" />
        </div>
      </div>
    </div>
  );
}
