'use client';

// Combined dropdown filters for stock, visibility, and interval.

import { Clock3, Eye, EyeOff, Filter, Layers3, Package, PackageX, RotateCcw } from 'lucide-react';
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
  // Badge number shows how many filters are currently active.
  const activeFilterCount =
    (stockFilter !== 'all' ? 1 : 0) +
    (visibilityFilter !== 'all' ? 1 : 0) +
    (intervalFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    // One-click reset to default "all" values.
    onStockFilterChange('all');
    onVisibilityFilterChange('all');
    onIntervalFilterChange('all');
  };

  const checkboxItemClassName = (isActive: boolean) =>
    `group cursor-pointer py-1.5 transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent/15 text-foreground hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground'
        : 'hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground'
    }`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="default"
            variant="outline"
            className="text-button control-h w-full justify-between bg-card px-3 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 focus-visible:ring-[0.5px] focus-visible:ring-accent focus-visible:ring-offset-0 sm:w-auto"
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
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Stock Status
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'in-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'in-stock' : 'all')}
            className={checkboxItemClassName(stockFilter === 'in-stock')}
          >
            <Package className="mr-2.5 size-3.5 shrink-0 !text-accent" />
            In Stock
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stockFilter === 'out-of-stock'}
            onCheckedChange={(checked) => onStockFilterChange(checked ? 'out-of-stock' : 'all')}
            className={checkboxItemClassName(stockFilter === 'out-of-stock')}
          >
            <PackageX className="mr-2.5 size-3.5 shrink-0 !text-accent" />
            Out of Stock
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Visibility
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'visible'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'visible' : 'all')}
            className={checkboxItemClassName(visibilityFilter === 'visible')}
          >
            <Eye className="mr-2.5 size-3.5 shrink-0 !text-accent" />
            Visible
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibilityFilter === 'hidden'}
            onCheckedChange={(checked) => onVisibilityFilterChange(checked ? 'hidden' : 'all')}
            className={checkboxItemClassName(visibilityFilter === 'hidden')}
          >
            <EyeOff className="mr-2.5 size-3.5 shrink-0 !text-accent" />
            Hidden
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Availability Interval
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={intervalFilter === 'all'}
            onCheckedChange={(checked) => {
              if (checked) onIntervalFilterChange('all');
            }}
            className={checkboxItemClassName(intervalFilter === 'all')}
          >
            <Layers3 className="mr-2.5 size-3.5 shrink-0 !text-accent" />
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
              <Clock3 className="mr-2.5 size-3.5 shrink-0 !text-accent" />
              {interval.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={clearFilters}
            className="group cursor-pointer py-1.5 transition-all duration-500 ease-in-out hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground"
          >
            <RotateCcw className="mr-2.5 size-3.5 shrink-0 text-accent" />
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
