'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = 'Search by Name or ID',
  width = 'w-full',
}: SearchBarProps) {
  return (
    <div className={`relative ${width}`}>
      <Search
        className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={18}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full shadow-sm/25 transition-all duration-500 ease-in-out bg-card"
      />
    </div>
  );
}
