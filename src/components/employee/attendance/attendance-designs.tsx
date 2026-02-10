// app/attendance/AttendanceDesign.tsx
'use client';

import AttendanceIcon from "./attendance";

export default function AttendanceDesign() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="p-6 rounded-xl shadow-lg border bg-white animate-fadeIn">
        {/* Decorative header */}
        <h2 className="text-lg font-bold text-center mb-4 animate-slideDown">
          Attendance Dashboard
        </h2>

        {/* Import the functional AttendanceIcon */}
        <AttendanceIcon />

        {/* Decorative footer */}
        <p className="text-xs text-muted-foreground text-center mt-4 animate-fadeUp">
          ⏰ Stay on track with your work hours
        </p>
      </div>
    </div>
  );
}
