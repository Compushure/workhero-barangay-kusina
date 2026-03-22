'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { cn } from '@/lib/utils';

interface MercadoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MercadoSearchBar({
  value,
  onChange,
  placeholder = 'Search by item name',
  className,
}: MercadoSearchBarProps) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(sanitizeSearchInput(e.target.value))}
        className="text-meta control-h w-full min-w-0 rounded-md border border-zinc-200 bg-card pr-3 pl-9 shadow-sm/25 transition-colors placeholder:text-gray-400 focus:border-accent focus:outline-none"
      />
    </div>
  );
}
