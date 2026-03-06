'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types';

interface SortButtonProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  options?: { value: SortOption; label: string }[];
  styleVariant?: 'default' | 'mercado';
}

export function SortButton({
  sortBy,
  onSortChange,
  options = [
    { value: 'pending', label: 'Pending Requests' },
    { value: 'approved', label: 'Approved Requests' },
    { value: 'denied', label: 'Denied Requests' },
  ],
  styleVariant = 'default',
}: SortButtonProps) {
  // Find the label for the current sort value
  const currentLabel = options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  const isMercadoStyle = styleVariant === 'mercado';

  const triggerClassName = isMercadoStyle
    ? 'group border border-gray-300 bg-zinc-50/75 text-[#131C2A] hover:bg-accent-secondary hover:text-white hover:shadow-sm hover:scale-103 transform-gpu rounded-lg w-35'
    : 'bg-foreground hover:bg-[#af3b3f] rounded-full text-white w-35';

  const itemClassName = (isActive: boolean) =>
    isMercadoStyle
      ? `cursor-pointer transition-all duration-400 ease-in-out ${
          isActive
            ? 'bg-accent-secondary text-white font-medium'
            : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
        }`
      : `cursor-pointer transition-all duration-500 ease-in-out ${isActive ? 'bg-red-100' : ''}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="w-48 bg-card text-foreground shadow-sm/25 hover:bg-card hover:text-foreground hover:brightness-90 transition-all duration-400 ease-in-out cursor-pointer justify-between"
          // className={`${triggerClassName} cursor-pointer shadow-sm/50 flex justify-between transition-all duration-500 ease-in-out`}
        >
          {/* Label on the left */}
          <span className="truncate">{currentLabel}</span>
          {/* Arrow on the right */}
          <ArrowUpDown size={18} className='text-accent'/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`cursor-pointer transition-all duration-400 ease-in-out ${sortBy === opt.value ? 'bg-accent text-card' : 'hover:bg-accent/25!'}
            `}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
