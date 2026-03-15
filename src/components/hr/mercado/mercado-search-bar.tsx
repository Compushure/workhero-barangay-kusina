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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(sanitizeSearchInput(e.target.value))}
        className="control-h w-full rounded-lg border border-zinc-200 bg-card pl-10 pr-3 text-meta text-foreground shadow-sm/25 transition-colors placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-0"
      />
    </div>
  );
}
