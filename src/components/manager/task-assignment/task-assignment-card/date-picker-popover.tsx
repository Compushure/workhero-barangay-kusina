'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, CalendarIcon } from 'lucide-react';

interface DatePickerPopoverProps {
  deadline: Date | null;
  onDeadlineChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DatePickerPopover({
  deadline,
  onDeadlineChange,
  disabled = false,
}: DatePickerPopoverProps) {
  const deadlineDisplay = deadline
    ? deadline.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    : 'Set Deadline';

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !disabled) {
      // Store selected day as a stable timestamp so timezone conversion keeps the same calendar date.
      const stableDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
      );
      onDeadlineChange(stableDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-zinc-50 text-primary flex items-center gap-4 cursor-pointer transition-all duration-400 ease-in-out shadow-sm/25 hover:bg-[#fafafa] hover:brightness-90 text-xs h-7 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CalendarIcon className="size-3.5 text-accent" />
          <span className={`${deadline ? 'text-accent' : 'text-secondary'}`}>
            {deadlineDisplay}
          </span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto cursor-pointer p-0 bg-white scale-75" align="start">
        <div className="p-2">
          <Calendar
            mode="single"
            selected={deadline || undefined}
            onSelect={handleDateSelect}
            disabled={(date) => disabled || date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
