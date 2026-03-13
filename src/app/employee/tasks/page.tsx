import type { Metadata } from 'next';
import { TasksPage } from '@/components/employee/task-status';

export const metadata: Metadata = {
  title: 'WorkHero | Tasks',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function EmployeeTasksPage() {
  return <TasksPage />;
}
