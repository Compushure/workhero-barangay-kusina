'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';

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
      <PageHeader title={title} subtitle={description} />

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by item name"
            className="pl-10"
            onChange={(e) => onSearch?.(sanitizeSearchInput(e.target.value))}
          />
        </div>
        <Select onValueChange={onSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest</SelectItem>
            <SelectItem value="date-asc">Oldest</SelectItem>
            <SelectItem value="employee">Employee Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
