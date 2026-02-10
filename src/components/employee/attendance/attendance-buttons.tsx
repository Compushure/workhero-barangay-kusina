'use client';

import { Button } from "@/components/ui/button";
import { UserCheck, LogIn, Coffee } from "lucide-react";

interface Props {
  status: any;
  isBusy: boolean;
  handleClick: (action: "timein" | "timeout") => void;
  handleBreakClick: (action: "startbreak" | "endbreak") => void;
}

export default function AttendanceButtons({
  status,
  isBusy,
  handleClick,
  handleBreakClick,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Time In */}
      <Button
        onClick={() => handleClick("timein")}
        disabled={isBusy || status?.isAbsent || !status?.canTimeIn}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 rounded-full disabled:opacity-50"
      >
        <LogIn className="w-5 h-5 text-gray-500" />
        <span>Time In</span>
      </Button>

      {/* Time Out */}
      <Button
        onClick={() => handleClick("timeout")}
        disabled={isBusy || status?.isAbsent || !status?.canTimeOut}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 rounded-full disabled:opacity-50"
      >
        <UserCheck className="w-5 h-5 text-green-500" />
        <span>Time Out</span>
      </Button>

      {/* Start Break */}
      <Button
        onClick={() => handleBreakClick("startbreak")}
        disabled={isBusy || !status?.canStartBreak}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 rounded-full disabled:opacity-50"
      >
        <Coffee className="w-5 h-5 text-blue-500" />
        <span>Start Break</span>
      </Button>

      {/* End Break */}
      <Button
        onClick={() => handleBreakClick("endbreak")}
        disabled={isBusy || !status?.canEndBreak}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 rounded-full disabled:opacity-50"
      >
        <Coffee className="w-5 h-5 text-orange-500" />
        <span>End Break</span>
      </Button>
    </div>
  );
}
