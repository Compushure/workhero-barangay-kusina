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
    ? 'group border border-gray-300 bg-zinc-50/75 text-[#131C2A] hover:bg-accent-secondary hover:text-white hover:shadow-sm hover:scale-103 transform-gpu rounded-xl w-44 sm:flex-1 sm:min-w-[180px]'
    : 'bg-card hover:bg-gray-200 rounded-full text-primary w-32 sm:flex-1 sm:min-w-[160px]';

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
          size="sm"
          className={`${triggerClassName} cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm`}
        >
          {/* Label with fixed character width */}
          <span className="max-w-20 sm:max-w-32 truncate">{currentLabel}</span>
          {/* Arrow icon */}
          <ArrowUpDown
            size={14}
            className={
              isMercadoStyle
                ? 'text-[#131C2A] group-hover:text-white ml-1 shrink-0'
                : 'text-accent ml-1 shrink-0'
            }
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background rounded-xl">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={itemClassName(sortBy === opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
