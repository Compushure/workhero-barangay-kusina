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
    <div className="flex flex-col items-center gap-6">
      {/* Time In */}
      <Button
        onClick={() => handleClick('timein')}
        disabled={isBusy || status?.isAbsent || !status?.canTimeIn}
        className="w-72 flex items-center justify-center gap-3 px-6 py-5
                   border-4 border-black bg-green-300 text-black 
                   shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                   transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTimeInLoading ? (
          <ChefLoading />
        ) : (
          <>
            <LogIn className="w-6 h-6 text-black" />
            <span className="font-bold">Clock In</span>
          </>
        )}
      </Button>

      {/* Time Out */}
      <Button
        onClick={() => handleClick('timeout')}
        disabled={isBusy || status?.isAbsent || !status?.canTimeOut}
        className="w-72 flex items-center justify-center gap-3 px-6 py-5
                   border-4 border-black bg-red-300 text-black 
                   shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                   transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-6 h-6 text-black" />
        <span className="font-bold">Clock Out</span>
      </Button>

      {/* Start Break */}
      <Button
        onClick={() => handleBreakClick('startbreak')}
        disabled={isBusy || !status?.canStartBreak}
        className="w-72 flex items-center justify-center gap-3 px-6 py-5 
                   border-4 border-black bg-blue-300 text-black 
                   shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                   transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CupSoda className="w-6 h-6 text-black" />
        <span className="font-bold">Start Break</span>
      </Button>

      {/* End Break */}
      <Button
        onClick={() => handleBreakClick('endbreak')}
        disabled={isBusy || !status?.canEndBreak}
        className="w-72 flex items-center justify-center gap-3 px-6 py-5 
                   border-4 border-black bg-orange-300 text-black 
                   shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                   transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Coffee className="w-6 h-6 text-black" />
        <span className="font-bold">End Break</span>
      </Button>
    </div>
  );
}
