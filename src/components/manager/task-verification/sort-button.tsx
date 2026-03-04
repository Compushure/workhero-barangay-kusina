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
    ? 'border border-gray-300 bg-zinc-50/75 text-[#131C2A] hover:text-[#f47812] hover:bg-[#FAA938]/20 hover:shadow-sm hover:scale-103 transform-gpu rounded-lg w-35'
    : 'bg-foreground hover:bg-[#af3b3f] rounded-full text-white w-35';

  const itemClassName = (isActive: boolean) =>
    isMercadoStyle
      ? `cursor-pointer transition-all duration-400 ease-in-out ${
          isActive
            ? 'bg-[#FAA938]/20 text-[#f47812] font-medium'
            : 'hover:bg-[#FAA938]/20 hover:text-[#f47812]'
        }`
      : `cursor-pointer transition-all duration-500 ease-in-out ${isActive ? 'bg-red-100' : ''}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className={`${triggerClassName} cursor-pointer shadow-sm/50 flex justify-between transition-all duration-500 ease-in-out`}
        >
          {/* Label on the left */}
          <span className="truncate">{currentLabel}</span>
          {/* Arrow on the right */}
          <ArrowUpDown size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
