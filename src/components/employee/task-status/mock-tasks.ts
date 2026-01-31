import type { TaskStatusItem } from './types';

export const currentTasks: TaskStatusItem[] = [
  {
    id: '1',
    taskType: 'Client-Centered Metrics',
    title: 'Special Client Commendation',
    progressCurrent: 0,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: '2',
    taskType: 'Name of Task Type',
    title: 'Internal Training',
    progressCurrent: 0,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: 'cur-3',
    taskType: 'CPD',
    title: 'CPD Training',
    progressCurrent: 2,
    progressMax: 5,
    points: 15,
    xp: 150,
    dueDate: '01/15/26',
  },
  {
    id: 'cur-4',
    taskType: 'Innovation',
    title: 'Process Improvement Idea',
    progressCurrent: 0,
    progressMax: 3,
    points: 20,
    xp: 200,
    dueDate: '02/01/26',
  },
  {
    id: 'cur-5',
    taskType: 'Team Collaboration',
    title: 'Cross-Department Workshop',
    progressCurrent: 1,
    progressMax: 4,
    points: 12,
    xp: 120,
    dueDate: '01/20/26',
  },
];

export const onReviewTasks: TaskStatusItem[] = [
  {
    id: '3',
    taskType: 'CPD',
    title: 'CPD Training',
    progressCurrent: 5,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: 'rev-2',
    taskType: 'Client-Centered Metrics',
    title: 'Client Feedback Survey',
    progressCurrent: 5,
    progressMax: 5,
    points: 15,
    xp: 150,
    dueDate: '12/28/25',
  },
  {
    id: 'rev-3',
    taskType: 'Innovation',
    title: 'Innovation Suggestion',
    progressCurrent: 3,
    progressMax: 3,
    points: 25,
    xp: 250,
    dueDate: '01/05/26',
  },
];

export const verifiedTasks: TaskStatusItem[] = [
  {
    id: '4',
    taskType: 'Client-Centered Metrics',
    title: 'Special Client Commendation',
    progressCurrent: 5,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: '5',
    taskType: 'Name of Task Type',
    title: 'Internal Training',
    progressCurrent: 5,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: '6',
    taskType: 'CPD',
    title: 'CPD Training',
    progressCurrent: 5,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
  {
    id: '7',
    taskType: 'Innovation',
    title: 'Innovation Suggestion',
    progressCurrent: 5,
    progressMax: 5,
    points: 10,
    xp: 100,
    dueDate: '12/12/25',
  },
];

export const deniedTasks: TaskStatusItem[] = [];

export const mockTaskStatusBoard = {
  Current: currentTasks,
  'On Review': onReviewTasks,
  Verified: verifiedTasks,
  'Denied Approval': deniedTasks,
} as const;
