'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DeadlinePopoverProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DeadlinePopover({ selectedDate, onDateChange }: DeadlinePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-gray-500 shadow-sm transition-colors hover:bg-gray-50">
          <span>Set Deadline</span>
          <ChevronDown size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => {
            onDateChange(date || null);
            setIsOpen(false);
          }}
          disabled={(date) => date < new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
