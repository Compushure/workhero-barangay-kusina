'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

/**
 * LeaderboardFilters: Dropdown filters for leaderboard view.
 * Includes category filter (Overall/Department/Position) and time period filter (Weekly/Monthly/Yearly).
 */
export default function LeaderboardFilters() {
  const [category, setCategory] = useState('overall');
  const [timePeriod, setTimePeriod] = useState('weekly');

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
      {/* Category Filter */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-40 bg-white border-[#E9C496] text-[#6D1616] font-medium rounded-lg hover:bg-[#F9F3E9] transition-colors">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="bg-white border-[#E9C496]">
          <SelectItem value="overall" className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]">
            Overall
          </SelectItem>
          <SelectItem
            value="department"
            className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]"
          >
            Department
          </SelectItem>
          <SelectItem value="position" className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]">
            Position
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Time Period Filter */}
      <Select value={timePeriod} onValueChange={setTimePeriod}>
        <SelectTrigger className="w-full sm:w-40 bg-white border-[#E9C496] text-[#6D1616] font-medium rounded-lg hover:bg-[#F9F3E9] transition-colors">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent className="bg-white border-[#E9C496]">
          <SelectItem value="weekly" className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]">
            Weekly
          </SelectItem>
          <SelectItem value="monthly" className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]">
            Monthly
          </SelectItem>
          <SelectItem value="yearly" className="text-[#6D1616] cursor-pointer hover:bg-[#F9F3E9]">
            Yearly
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
