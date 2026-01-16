'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderSectionProps {
  title: string;
  description?: string;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
}

export function HeaderSection({ title, description, onSearch, onSort }: HeaderSectionProps) {
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <Select onValueChange={onSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest</SelectItem>
            <SelectItem value="date-asc">Oldest</SelectItem>
            <SelectItem value="cost-desc">Cost (Highest)</SelectItem>
            <SelectItem value="cost-asc">Cost (Lowest)</SelectItem>
            <SelectItem value="employee">Employee Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
