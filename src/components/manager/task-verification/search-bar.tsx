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
  width = 'w-[320px]',
}: SearchBarProps) {
  return (
    <div className={`relative ${width}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={20}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-4 py-2 rounded-full shadow-sm/25 transition-all duration-500 ease-in-out"
      />
    </div>
  );
}
