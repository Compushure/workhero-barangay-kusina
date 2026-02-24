'use client';

import HeaderHUD from '../widgets/header-hud';
import NavSection from '../nav-section';
import CookingSection from './cooking-section';
import { RankWidget } from './rank-panel';
import TasksTable from './tasks-table';
import { Card, CardContent } from '@/components/ui/card';

export default function EmployeeDashboardClient() {
  const tasks = [
    {
      title: 'Special Client Commendation',
      category: 'Client-Centered Metrics',
      progress: '0/5',
      points: '100',
      xp: '10',
      dueDate: '12/12/25',
    },
    {
      title: 'Internal Training',
      category: 'Name of Task Type',
      progress: '0/5',
      points: '100',
      xp: '10',
      dueDate: '12/12/25',
    },
  ];

  return (
    <div
      // className="flex flex-col min-h-screen bg-bottom bg-repeat bg-contain"
      // style={{ backgroundImage: "url('/w.png')" }}
      className="flex flex-col min-h-screen bg-[radial-gradient(circle,#FFFCF5_0%,#EFC18F_40%,#D68B5C_60%,#60203D_100%)]"
    >
      {/* Row 1: Header HUD */}
      <header>
        <HeaderHUD />
      </header>

      {/* Row 2: Nav (20%) + Cooking (60%) + Rank (20%) */}
      <section className="relative flex gap-4 p-4 flex-none h-87">
        {/* Background image layer only for Row 2 */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url('/window.png')` }}
        />

        {/* Foreground content */}
        <div className="relative z-10 flex gap-4 w-full">
          {/* Left column: 20% */}
          <div className="w-[20%]">
            <Card className="bg-transparent shadow-none border-none h-full">
              <CardContent className="h-full">
                <NavSection />
              </CardContent>
            </Card>
          </div>

          {/* Middle column: 60% */}
          <div className="w-[60%] flex">
            <CookingSection className="w-full h-full" />
          </div>

          <div className="w-[20%] min-w-[280px] flex items-start justify-start">
            <Card className="bg-transparent shadow-none border-none">
              <CardContent className="p-0">
                <RankWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Row 3: Tasks aligned under Cooking (center 60%) */}
      <section className="flex gap-4 p-4">
        <div className="w-[20%]"></div>
        <div className="w-[60%]">
          <Card className="bg-background shadow-none border-none">
            <CardContent className="p-4">
              <TasksTable tasks={tasks} />
            </CardContent>
          </Card>
        </div>
        <div className="w-[20%]"></div>
      </section>
    </div>
  );
}
