'use client';

import { Filter, PackageX, Package, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StockFilter = 'all' | 'in-stock' | 'out-of-stock';
export type VisibilityFilter = 'all' | 'visible' | 'hidden';
export type IntervalFilter = 'all' | 'weekly' | 'monthly' | 'yearly';

const intervalOptions: Array<{ value: Exclude<IntervalFilter, 'all'>; label: string }> = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface MercadoFilterToggleProps {
  stockFilter: StockFilter;
  visibilityFilter: VisibilityFilter;
  intervalFilter: IntervalFilter;
  onStockFilterChange: (value: StockFilter) => void;
  onVisibilityFilterChange: (value: VisibilityFilter) => void;
  onIntervalFilterChange: (value: IntervalFilter) => void;
  className?: string;
}

export function MercadoFilterToggle({
  stockFilter,
  visibilityFilter,
  intervalFilter,
  onStockFilterChange,
  onVisibilityFilterChange,
  onIntervalFilterChange,
  className,
}: MercadoFilterToggleProps) {
  const activeFilterCount =
    (stockFilter !== 'all' ? 1 : 0) +
    (visibilityFilter !== 'all' ? 1 : 0) +
    (intervalFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    onStockFilterChange('all');
    onVisibilityFilterChange('all');
    onIntervalFilterChange('all');
  };

  const checkboxItemClassName = (isActive: boolean) =>
    `group cursor-pointer py-1.5 transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent-secondary text-white'
        : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
    }`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="default"
            variant="outline"
            className="text-button control-h w-full justify-between rounded-md border border-gray-200 bg-card px-3 py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-auto"
          >
            <Filter className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 rounded-full bg-accent/75 px-1.5 py-0 text-[11px] leading-none text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={8}
          collisionPadding={12}
          className="manager-dropdown-content w-72 max-h-136 overflow-visible p-1"
        >
          <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
            Stock Status
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'in-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'in-stock' : 'all')}
            className={checkboxItemClassName(stockFilter === 'in-stock')}
          >
            <Package className="mr-2 h-4 w-4 text-green-500 transition-colors group-hover:text-white group-data-highlighted:text-white" />
            In Stock
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'out-of-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'out-of-stock' : 'all')}
            className={checkboxItemClassName(stockFilter === 'out-of-stock')}
          >
            <PackageX className="mr-2 h-4 w-4 text-red-500 transition-colors group-hover:text-white group-data-highlighted:text-white" />
            Out of Stock
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
            Visibility
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'visible'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'visible' : 'all')}
            className={checkboxItemClassName(visibilityFilter === 'visible')}
          >
            <Eye className="mr-2 h-4 w-4 text-blue-500 transition-colors group-hover:text-white group-data-highlighted:text-white" />
            Visible
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'hidden'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'hidden' : 'all')}
            className={checkboxItemClassName(visibilityFilter === 'hidden')}
          >
            <EyeOff className="mr-2 h-4 w-4 text-gray-500 transition-colors group-hover:text-white group-data-highlighted:text-white" />
            Hidden
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
            Availability Interval
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={intervalFilter === 'all'}
            onCheckedChange={(checked) => {
              if (checked) onIntervalFilterChange('all');
            }}
            className={checkboxItemClassName(intervalFilter === 'all')}
          >
            All Intervals
          </DropdownMenuCheckboxItem>
          {intervalOptions.map((interval) => (
            <DropdownMenuCheckboxItem
              key={interval.value}
              checked={intervalFilter === interval.value}
              onCheckedChange={(checked) => {
                if (checked) onIntervalFilterChange(interval.value);
                else onIntervalFilterChange('all');
              }}
              className={checkboxItemClassName(intervalFilter === interval.value)}
            >
              {interval.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={clearFilters}
            className="cursor-pointer py-1.5 pl-8 text-secondary hover:text-foreground"
          >
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
