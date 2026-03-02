'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RankLogPeriodType } from '@/types';

const PERIOD_OPTIONS: { value: RankLogPeriodType; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface PeriodTypeDropdownProps {
  currentType: RankLogPeriodType;
  basePath: string;
}

export function PeriodTypeDropdown({ currentType, basePath }: PeriodTypeDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('type', value);
    // When switching period type, reset to list view and first page
    params.delete('id');
    params.delete('page');

    const queryString = params.toString();
    const href = queryString ? `${basePath}?${queryString}` : basePath;
    router.push(href);
  };

  return (
    <Select value={currentType} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px] bg-white border-[#E9C496] text-[#6D1616]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
