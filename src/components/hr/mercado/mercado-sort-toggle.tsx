'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'newest' | 'oldest';

interface MercadoSortToggleProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
};

export function MercadoSortToggle({ value, onChange }: MercadoSortToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-zinc-50/75 text-[#131C2A] hover:text-[#f47812] hover:bg-[#FAA938]/20 hover:shadow-sm hover:scale-103 transform-gpu transition-all duration-400 ease-in-out">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sort: </span>
          <span className="font-medium">{sortLabels[value]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sort by Date
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onChange('newest')} className="cursor-pointer">
          <ArrowDown className="mr-2 h-4 w-4" />
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange('oldest')} className="cursor-pointer">
          <ArrowUp className="mr-2 h-4 w-4" />
          Oldest First
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
