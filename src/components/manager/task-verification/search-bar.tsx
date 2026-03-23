'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = 'Search for employee and task name',
  width = 'w-full',
}: SearchBarProps) {
  return (
    <div className={`relative ${width}`}>
      <Search
        className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
        className="w-full h-8 sm:h-9 truncate pl-8 sm:pl-9 pr-2 sm:pr-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-full shadow-sm/25 transition-all duration-500 ease-in-out bg-card"
      />
    </div>
  );
}
