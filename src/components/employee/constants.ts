/**
 * Constants and mock data for the employee dashboard
 */

import { Task, EmployeeStats, RankingInfo, NotificationMessage } from './types';

export const MOCK_EMPLOYEE_STATS: EmployeeStats = {
  coins: 99999,
  level: 3,
  xp: {
    current: 999,
    total: 999,
  },
};

export const MOCK_RANKING_INFO: RankingInfo = {
  rank: 12,
  period: 'Dec 8 - Dec 12',
  totalFiestasEarned: 9,
  totalXpEarned: 250,
};

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Special Client Commendation',
    category: 'client-centered',
    completed: 0,
    total: 5,
    xpReward: 100,
    dueDate: '12/12/25',
  },
  {
    id: '2',
    title: 'Internal Training',
    category: 'internal',
    completed: 0,
    total: 5,
    xpReward: 100,
    dueDate: '12/12/25',
  },
  {
    id: '3',
    title: 'CPD Training',
    category: 'cpd',
    completed: 0,
    total: 5,
    xpReward: 100,
    dueDate: '12/12/25',
  },
];

export const MOCK_NOTIFICATION: NotificationMessage = {
  id: '1',
  text: 'You cooked Batchy!',
  type: 'success',
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'upcoming', label: 'Upcoming Due Date' },
  { value: 'progress', label: 'By Progress' },
  { value: 'rewards', label: 'Highest Rewards' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'all-tasks', label: 'All Tasks', icon: 'ListTodo' },
  { id: 'mercado', label: 'Mercado', icon: 'ShoppingBag' },
];
