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
  const deadlineDisplay = deadline ? deadline.toISOString().split('T')[0] : 'Set Deadline';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>{deadlineDisplay}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={deadline || undefined}
            onSelect={(date) => onDeadlineChange(date || null)}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            // classNames={{
            //   day: "hover:bg-[#690003] hover:text-white aria-selected:bg-[#690003] aria-selected:text-white",
            // }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
