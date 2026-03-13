'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface MercadoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MercadoSearchBar({
  value,
  onChange,
  placeholder = 'Search by item name',
}: MercadoSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(sanitizeSearchInput(e.target.value))}
        className="pl-9 h-10 bg-white border-gray-200 rounded-lg"
      />
    </div>
  );
}
