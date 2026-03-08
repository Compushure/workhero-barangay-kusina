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
    <div className="rounded-3xl bg-background p-4 sm:p-5 lg:p-6 border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25">
      {/* Header with collapse toggle - only on small screens */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full mb-3 sm:mb-4 sm:pointer-events-none"
        type="button"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <p className="text-sm font-semibold text-foreground">Search & Filters</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform sm:hidden ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      {/* Collapsible content - only on small screens */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'hidden sm:grid' : 'grid'
        }`}
      >
        {/* Search - Full width on mobile, spans 2 cols on md+ */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="search" className="text-xs sm:text-sm text-foreground">
            Search by Name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              id="search"
              placeholder="Search by name..."
              className={`pl-10 pr-9 border-border focus:border-accent focus:ring-accent text-sm sm:text-base ${
                isDebouncing ? 'bg-muted/50' : 'bg-white'
              }`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
            className="flex items-center gap-2 text-xs sm:text-sm text-foreground"
          >
            <span className="hidden sm:inline">Employee Type</span>
            <span className="inline sm:hidden">Type</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select value={employeeTypeFilter} onValueChange={onEmployeeTypeChange} disabled={isLoading}>
            <SelectTrigger
              id="filter-type"
              className={`bg-white border-border focus:border-accent focus:ring-accent text-sm sm:text-base ${
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
            className="flex items-center gap-2 text-xs sm:text-sm text-foreground"
          >
            <span className="hidden sm:inline">Employment Status</span>
            <span className="inline sm:hidden">Status</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select
            value={employmentStatusFilter}
            onValueChange={onEmploymentStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="filter-status"
              className={`bg-white border-border focus:border-accent focus:ring-accent text-sm sm:text-base ${
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

        {/* Sort - Full width on mobile, spans 2 cols on md */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sort" className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
            Sort By
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600" />}
          </Label>
          <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
            <SelectTrigger
              id="sort"
              className={`bg-white border-border focus:border-accent focus:ring-accent text-sm sm:text-base ${
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
  );
}
