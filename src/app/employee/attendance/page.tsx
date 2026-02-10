// app/attendance/page.tsx
import AttendanceDesign from "@/components/employee/attendance/attendance-designs";
import { Suspense } from "react";
import { CookingPot } from "lucide-react";

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className='h-full w-full justify-center items-center flex flex-col gap-1'>
        <CookingPot className='animate-bounce size-10'/>
        <span>Loading Attendance Dashboard...</span>
      </div>
    }>
      <AttendanceDesign />
    </Suspense>
  );
}