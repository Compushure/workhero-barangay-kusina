import { ReactNode } from 'react';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  centerContent: ReactNode;
  ranking: ReactNode;
  taskTable: ReactNode;
}

/**
 * DashboardLayout - Server Component
 * Layout wrapper structured as:
 * - Top: Stats bar (in parent)
 * - Middle: 3-column layout (nav | cooking | ranking)
 * - Bottom: Task table
 */
export function DashboardLayout({
  sidebar,
  centerContent,
  ranking,
  taskTable,
}: DashboardLayoutProps) {
  return (
    <div className="space-y-4">
      {/* Middle Section: 3-Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Navigation (1/4 width) */}
        <div className="flex flex-col gap-3 lg:col-span-3">{sidebar}</div>

        {/* Center Column: Cooking Content (1/2 width) */}
        <div className="lg:col-span-6">{centerContent}</div>

        {/* Right Column: Ranking (1/4 width) */}
        <div className="flex flex-col lg:col-span-3">{ranking}</div>
      </div>

      {/* Bottom Section: Task Table */}
      <div className="mx-auto w-full rounded-2xl bg-white p-4 shadow-lg lg:w-3/5">{taskTable}</div>
    </div>
  );
}
