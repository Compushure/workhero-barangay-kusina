'use client';

import { Button } from '@/components/ui/button';

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
          <p className="mt-2 text-[#4d4d4dd8] text-lg">
            You&apos;ve clocked out for today. See you again tomorrow! 👋
          </p>
        </div>
      )}

      {/* Initial: Time In */}
      {!status?.hasTimedIn && status?.canTimeIn && !status?.hasTimedOut && (
        <Button
          onClick={() => handleClick('timein')}
          disabled={isBusy || status?.isAbsent}
          className="w-72 text-3xl flex items-center rounded-sm justify-center cursor-pointer gap-3 px-6 py-5
                     border-3 border-[#47331F] bg-[#CF8B22] text-black
                     shadow-[4px_4px_0px_#000] shadow-[#3017008e] hover:bg-[#b5771c] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTimeInLoading ? (
            <span className="font-jersey text-sm">Loading...</span>
          ) : (
            <span className="font-jersey text-2xl">📍 TIME IN</span>
          )}
        </Button>
      )}

      {/* After Time In: Break + Time Out */}
      {status?.hasTimedIn && !status?.isOnBreak && !status?.hasTimedOut && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleBreakClick('startbreak')}
            disabled={isBusy || !status?.canStartBreak}
            className="w-36 text-3xl flex items-center rounded-sm justify-center cursor-pointer gap-2 px-4 py-4
                       border-3 border-[#47331F] bg-[#5B3E29] text-white
                       shadow-[4px_4px_0px_#000] shadow-[#3017008e] hover:bg-[#5B3E29] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-jersey text-xl">🍩 Break Time</span>
          </Button>

          <Button
            onClick={() => handleClick('timeout')}
            disabled={isBusy || !status?.canTimeOut}
            className="w-36 text-3xl flex items-center rounded-sm justify-center cursor-pointer gap-2 px-4 py-4
                       border-3 border-[#47331F] bg-[#C22626] text-white
                       shadow-[4px_4px_0px_#000] shadow-[#3017008e] hover:bg-[#C22626] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-jersey text-xl">👋 Time Out</span>
          </Button>
        </div>
      )}

      {/* On Break: End Break */}
      {status?.isOnBreak && !status?.hasTimedOut && (
        <Button
          onClick={() => handleBreakClick('endbreak')}
          disabled={isBusy || !status?.canEndBreak}
          className="w-72 text-3xl font-jersey flex items-center justify-center cursor-pointer gap-3 px-6 py-5
                     border-3 border-[#47331F] bg-[#D18C23] text-black
                     shadow-[4px_4px_0px_#000] shadow-[#3017008e] hover:bg-[#D18C23] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-jersey text-xl">🔙 Back to Work</span>
        </Button>
      )}
    </div>
  );
}
