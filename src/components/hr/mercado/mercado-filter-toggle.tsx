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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 h-10 px-4 rounded-lg border-gray-300 bg-zinc-50/75 text-[#131C2A] hover:text-[#f47812] hover:bg-[#FAA938]/20 hover:shadow-sm hover:scale-103 transform-gpu transition-all duration-400 ease-in-out"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Stock Status
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'in-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'in-stock' : 'all')}
            className="cursor-pointer"
          >
            <Package className="mr-2 h-4 w-4 text-green-500" />
            In Stock
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'out-of-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'out-of-stock' : 'all')}
            className="cursor-pointer"
          >
            <PackageX className="mr-2 h-4 w-4 text-red-500" />
            Out of Stock
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Visibility
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'visible'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'visible' : 'all')}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-500" />
            Visible
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'hidden'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'hidden' : 'all')}
            className="cursor-pointer"
          >
            <EyeOff className="mr-2 h-4 w-4 text-gray-500" />
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
            className="cursor-pointer"
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
              className="cursor-pointer"
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
