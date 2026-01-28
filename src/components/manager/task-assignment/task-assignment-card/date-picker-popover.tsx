'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, CalendarIcon } from 'lucide-react';

interface DatePickerPopoverProps {
  deadline: Date | null;
  onDeadlineChange: (date: Date | null) => void;
}

export function DatePickerPopover({ deadline, onDeadlineChange }: DatePickerPopoverProps) {
  const deadlineDisplay = deadline
    ? deadline.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    : 'Set Deadline';

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Adjust for Manila timezone (UTC+8) to prevent showing previous day
      const manilaOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
      const adjustedDate = new Date(date.getTime() + manilaOffset);
      onDeadlineChange(adjustedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-white border-2 border-gray-300 text-black hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-all duration-500 ease-in-out">
          <CalendarIcon className="w-4 h-4" />
          <span>{deadlineDisplay}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto cursor-pointer p-0 bg-white" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={deadline || undefined}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            classNames={{
              day: 'hover:bg-[#D4A574] hover:text-gray-900 rounded-md transition-colors',
              day_selected: 'bg-[#690003] text-white',
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
