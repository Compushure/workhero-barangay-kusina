import type { AssignedEmployee, Task } from '@/types';

export interface Employee {
  id: string;
  name: string;
  empId: string;
  tenure: string;
  assignedTasks: Task[];
}

// Mock employee data
export const MOCK_EMPLOYEES: AssignedEmployee[] = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    empId: 'EMP001',
    tenure: 'Junior staff',
    completedAttempts: 0,
  },
  {
    id: '2',
    name: 'Nicholas A. Hoult',
    empId: 'EMP002',
    tenure: 'Senior staff',
    completedAttempts: 0,
  },
  { id: '3', name: 'Mariah Carey', empId: 'EMP003', tenure: 'Mid-level', completedAttempts: 0 },
  {
    id: '4',
    name: 'Joshua Ullimer A. Demerin',
    empId: 'EMP004',
    tenure: 'Junior staff',
    completedAttempts: 0,
  },
  { id: '5', name: 'Damon Albarn', empId: 'EMP005', tenure: 'Senior staff', completedAttempts: 0 },
  {
    id: '6',
    name: 'José Protacio Rizal Mercado y Alonso',
    empId: 'EMP006',
    tenure: 'Junior Staff',
    completedAttempts: 0,
  },
  {
    id: '7',
    name: 'Rob Baban',
    empId: 'EMP007',
    tenure: 'Junior Staff',
    completedAttempts: 0,
  },
  {
    id: '8',
    name: 'JP Rosalita',
    empId: 'EMP008',
    tenure: 'Junior Staff',
    completedAttempts: 0,
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    name: '2024 FS Preparation',
    type: 'Core Deliverables',
    isRepeatable: true,
    points: 5,
    xp: 25,
    maxAttempts: 5,
  },
  {
    id: 'task2',
    name: '2024 ITR Preparation Completeness',
    type: 'Core Deliverables',
    isRepeatable: false,
    points: 5,
    xp: 25,
    maxAttempts: 1,
  },
  {
    id: 'task3',
    name: 'Turnaround Completion Time (TAT)',
    type: 'Compliance & Discipline',
    isRepeatable: true,
    points: 3,
    xp: 25,
    maxAttempts: 5,
  },
  {
    id: 'task4',
    name: 'Zero Compliance Violations',
    type: 'Compliance & Discipline',
    isRepeatable: false,
    points: 5,
    xp: 25,
    maxAttempts: 1,
  },
  {
    id: 'task5',
    name: 'Advanced Training',
    type: 'Growth & Development',
    isRepeatable: true,
    points: 5,
    xp: 25,
    maxAttempts: 5,
  },
];
