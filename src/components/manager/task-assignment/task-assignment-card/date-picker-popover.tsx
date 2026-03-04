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
        <Button className="bg-zinc-50 text-primary flex items-center gap-6 cursor-pointer transition-all duration-400 ease-in-out shadow-sm/25 hover:bg-accent/15">
          <CalendarIcon className="size-4 text-accent" />
          <span className={`${deadline ? 'text-accent' : 'text-secondary'}`}>{deadlineDisplay}</span>
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
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
