'use client';

import {
  ArrowUpDown,
  BadgeCheck,
  CalendarArrowDown,
  CalendarArrowUp,
  CircleAlert,
  Clock3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface SortButtonProps {
  sortBy: SortOption | VerificationDateSort;
  onSortChange: (value: SortOption | VerificationDateSort) => void;
  options?: VerificationSortButtonOption[];
  styleVariant?: 'default' | 'mercado';
  menuLabel?: string;
  widthClassName?: string;
}

type VerificationDateSort = 'date-desc' | 'date-asc';

interface VerificationSortButtonOption {
  value: SortOption | VerificationDateSort;
  label: string;
  icon?: LucideIcon;
}

const defaultStatusOptions: VerificationSortButtonOption[] = [
  { value: 'pending', label: 'Pending Requests', icon: Clock3 },
  { value: 'approved', label: 'Approved Requests', icon: BadgeCheck },
  { value: 'denied', label: 'Denied Requests', icon: CircleAlert },
];

const defaultDateOptions: VerificationSortButtonOption[] = [
  { value: 'date-desc', label: 'Newest First', icon: CalendarArrowDown },
  { value: 'date-asc', label: 'Oldest First', icon: CalendarArrowUp },
];

export function SortButton({
  sortBy,
  onSortChange,
  options = defaultStatusOptions,
  styleVariant = 'default',
  menuLabel,
  widthClassName,
}: SortButtonProps) {
  // Find the label for the current sort value
  const currentLabel = options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  const isMercadoStyle = styleVariant === 'mercado';

  const triggerClassName = isMercadoStyle
      ? 'group border border-gray-300 bg-zinc-50/75 text-primary hover:bg-accent-secondary hover:text-white hover:shadow-sm hover:scale-103 transform-gpu rounded-lg w-28 sm:flex-1 sm:min-w-[140px]'
    : `bg-card hover:bg-card hover:brightness-90 rounded-md text-primary ${widthClassName ?? 'w-30 sm:flex-1 sm:min-w-[152px]'}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={`${triggerClassName} control-h cursor-pointer shadow-sm/50 flex justify-between items-center transition-all duration-500 ease-in-out px-2.5 sm:px-3`}
        >
          {/* Label with fixed character width */}
          <span className="max-w-18 sm:max-w-28 truncate">{currentLabel}</span>
          {/* Arrow icon */}
          <ArrowUpDown
            size={12}
            className={
              isMercadoStyle
                ? 'text-primary group-hover:text-white ml-1 shrink-0'
                : 'text-accent ml-1 shrink-0'
            }
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {menuLabel && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
              {menuLabel}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out ${sortBy === opt.value ? 'bg-accent/15 text-foreground' : ''}`}
          >
            {opt.icon && <opt.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />}
            <span className="truncate">{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { defaultStatusOptions, defaultDateOptions };
