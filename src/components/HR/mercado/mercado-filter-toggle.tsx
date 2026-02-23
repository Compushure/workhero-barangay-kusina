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

interface MercadoFilterToggleProps {
  stockFilter: StockFilter;
  visibilityFilter: VisibilityFilter;
  onStockFilterChange: (value: StockFilter) => void;
  onVisibilityFilterChange: (value: VisibilityFilter) => void;
}

export function MercadoFilterToggle({
  stockFilter,
  visibilityFilter,
  onStockFilterChange,
  onVisibilityFilterChange,
}: MercadoFilterToggleProps) {
  const activeFilterCount = (stockFilter !== 'all' ? 1 : 0) + (visibilityFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    onStockFilterChange('all');
    onVisibilityFilterChange('all');
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 h-10 px-4 rounded-lg border-gray-300 hover:bg-gray-50"
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
        <DropdownMenuContent align="end" className="w-56">
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
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 px-3 text-sm text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
