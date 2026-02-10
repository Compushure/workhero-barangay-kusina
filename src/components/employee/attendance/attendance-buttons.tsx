import { Button } from '@/components/ui/button';
import { LogIn, Coffee, CupSoda, LogOut } from 'lucide-react';
import ChefLoading from './time-in-animation';

interface Props {
  status: any;
  isBusy: boolean;
  isTimeInLoading: boolean;
  handleClick: (action: 'timein' | 'timeout') => void;
  handleBreakClick: (action: 'startbreak' | 'endbreak') => void;
}

export default function AttendanceButtons({
  status,
  isBusy,
  isTimeInLoading,
  handleClick,
  handleBreakClick,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Time In */}
      <Button
        onClick={() => handleClick('timein')}
        disabled={isBusy || status?.isAbsent || !status?.canTimeIn}
        className="w-64 flex items-center justify-center gap-3 px-4 py-4
                   border-4 border-black bg-green-300 text-black 
                   shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTimeInLoading ? (
          <ChefLoading />
        ) : (
          <>
            <LogIn className="w-5 h-5 text-black" />
            <span>Time In</span>
          </>
        )}
      </Button>

      {/* Time Out */}
      <Button
        onClick={() => handleClick('timeout')}
        disabled={isBusy || status?.isAbsent || !status?.canTimeOut}
        className="w-64 flex items-center justify-center gap-3 px-4 py-4
                   border-4 border-black bg-red-300 text-black 
                   shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-5 h-5 text-black" />
        <span>Time Out</span>
      </Button>

      {/* Start Break */}
      <Button
        onClick={() => handleBreakClick('startbreak')}
        disabled={isBusy || !status?.canStartBreak}
        className="w-64 flex items-center justify-center gap-3 px-4 py-4 
                   border-4 border-black bg-blue-300 text-black 
                   shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CupSoda className="w-5 h-5 text-black" />
        <span>Start Break</span>
      </Button>

      {/* End Break */}
      <Button
        onClick={() => handleBreakClick('endbreak')}
        disabled={isBusy || !status?.canEndBreak}
        className="w-64 flex items-center justify-center gap-3 px-4 py-4 
                   border-4 border-black bg-orange-300 text-black 
                   shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Coffee className="w-5 h-5 text-black" />
        <span>End Break</span>
      </Button>
    </div>
  );
}
