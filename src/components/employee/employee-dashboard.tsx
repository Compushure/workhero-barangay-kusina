'use client';

import { Clock, FileText, User } from 'lucide-react';
import PointsIcon from './points-widget';
import AttendanceIcon from './attendance-widget';
import LevelIcon from './level-widget';

export default function EmployeeDashboardClient() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your personal employee dashboard. View your information and submit requests.
          </p>
        </div>

        {/* Existing cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">My Profile</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View and manage your personal information and profile details.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Time & Attendance</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your work hours, attendance, and time-off requests.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">My Documents</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Access your employment documents, contracts, and certifications.
            </p>
          </div>
        </div>

        {/* HUD-style widgets */}
        <div className="flex items-center w-full">
          {[
            <PointsIcon key="points" />,
            <LevelIcon key="level" />,
            <AttendanceIcon key="attendance" />,
          ].map((icon, i) => (
            <div key={i} className="flex-1 flex justify-start">
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
