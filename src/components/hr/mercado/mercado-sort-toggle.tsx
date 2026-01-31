'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MercadoSortToggleProps {
  value: 'newest' | 'oldest';
  onChange: (value: 'newest' | 'oldest') => void;
}

export function MercadoSortToggle({ value, onChange }: MercadoSortToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-[#730202] hover:bg-[#8B0000] text-white h-10 px-4 rounded-lg">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange('newest')}>
          <ArrowDown className="mr-2 h-4 w-4" />
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('oldest')}>
          <ArrowUp className="mr-2 h-4 w-4" />
          Oldest First
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
