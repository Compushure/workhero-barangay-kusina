'use client';

import { Button } from '@/components/ui/button';
import { Coffee, CupSoda, LogOut } from 'lucide-react';

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
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Already Timed Out */}
      {status?.hasTimedOut && (
        <div className="text-center">
          <span className="text-xl px-2 py-1 rounded-full inline-block bg-red-200 text-red-700 border border-red-400">
            ⚫ Clocked Out
          </span>
          <p className="mt-8 text-[#808080d8] text-sm">
            You've clocked out for today. See you again tomorrow!👋
          </p>
        </div>
      )}

      {/* Initial: Time In */}
      {!status?.hasTimedIn && status?.canTimeIn && !status?.hasTimedOut && (
        <Button
          onClick={() => handleClick('timein')}
          disabled={isBusy || status?.isAbsent}
          className="w-72 text-3xl flex items-center justify-center gap-3 px-6 py-5
                     border-4 border-black bg-[#CF8B22] text-black
                     shadow-[6px_6px_0px_#000] hover:translate-y-1 cursor-pointer hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTimeInLoading ? (
            <span className="font-jersey text-sm">Loading...</span>
          ) : (
            <>
              <span className="font-jersey">📍 Time In</span>
            </>
          )}
        </Button>
      )}

      {/* After Time In: Break + Time Out */}
      {status?.hasTimedIn && !status?.isOnBreak && !status?.hasTimedOut && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleBreakClick('startbreak')}
            disabled={isBusy || !status?.canStartBreak}
            className="w-36 flex items-center justify-center gap-2 px-4 py-4
                       border-4 border-black bg-purple-400 text-white
                       shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CupSoda className="w-5 h-5" />
            <span className="font-jersey text-sm">Break Time</span>
          </Button>

          <Button
            onClick={() => handleClick('timeout')}
            disabled={isBusy || !status?.canTimeOut}
            className="w-36 flex items-center justify-center gap-2 px-4 py-4
                       border-4 border-black bg-red-400 text-white
                       shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-jersey text-sm">👋 Time Out</span>
          </Button>
        </div>
      )}

      {/* On Break: End Break */}
      {status?.isOnBreak && !status?.hasTimedOut && (
        <Button
          onClick={() => handleBreakClick('endbreak')}
          disabled={isBusy || !status?.canEndBreak}
          className="w-72 text-3xl font-jersey flex items-center justify-center gap-3 px-6 py-5
                     border-4 border-black bg-yellow-300 text-black
                     shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Coffee className="w-6 h-6 text-black" />
          <span className="font-jersey">🔙 Back to Work</span>
        </Button>
      )}

      {/* After End Break: Time Out only */}
      {status?.hasTimedIn && !status?.isOnBreak && status?.canTimeOut && !status?.hasTimedOut && (
        <Button
          onClick={() => handleClick('timeout')}
          disabled={isBusy}
          className="w-72 text-3xl font-jersey flex items-center justify-center gap-3 px-6 py-5
                     border-4 border-black bg-red-400 text-white
                     shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-6 h-6 text-white" />
          <span className="font-jersey">👋 Time Out</span>
        </Button>
      )}
    </div>
  );
}