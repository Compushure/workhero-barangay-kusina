// app/attendance/page.tsx
import AttendanceIcon from "@/components/employee/attendance/attendance";
import { attendanceConfig } from "@/lib/attendance-config";

export default function AttendancePage() {
  // This is a server component: no hooks, no client state.
  // It can fetch server-side data or enforce auth before rendering.
  return (
    <div className="p-6">
      <AttendanceIcon config={attendanceConfig} />
    </div>
  );
}
