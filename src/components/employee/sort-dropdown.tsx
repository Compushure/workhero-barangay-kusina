'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS } from './constants';
import type { SortOption } from './types';

interface SortDropdownProps {
  onSortChange?: (sortBy: SortOption) => void;
}

/**
 * SortDropdown - Client Component
 * Dropdown for sorting tasks by different criteria
 */
export function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  return (
    <Select value={sortBy} onValueChange={handleSortChange}>
      <SelectTrigger className="w-32 rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
