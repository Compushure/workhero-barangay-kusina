'use client';

import { Filter, PackageX, Package, EyeOff, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

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
}

export function MercadoFilterToggle({
  stockFilter,
  visibilityFilter,
  intervalFilter,
  onStockFilterChange,
  onVisibilityFilterChange,
  onIntervalFilterChange,
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
    `group cursor-pointer transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent-secondary text-white'
        : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
    }`;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="group gap-2 h-10 px-4 rounded-xl border border-gray-300 bg-card text-foreground shadow-sm/25 hover:bg-accent-secondary hover:text-white transition-all duration-400 ease-in-out"
          >
            <Filter className="h-4 w-4 text-accent group-hover:text-white transition-all duration-400 ease-in-out" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 rounded-full p-0 text-[11px] leading-none bg-accent-secondary text-white flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
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

          <DropdownMenuLabel className="text-xs text-muted-foreground">
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

          <DropdownMenuLabel className="text-xs text-muted-foreground">
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
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button
          onClick={clearFilters}
          className="h-10 px-4 rounded-lg bg-primary-gradient text-zinc-50 hover:opacity-95"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
