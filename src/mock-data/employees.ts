export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
}

export interface Employee {
  id: string;
  name: string;
  empId: string;
  tenure: string;
  assignedTasks: Task[];
}

export const employees: Employee[] = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    empId: '09-0347-79',
    tenure: 'Junior staff',
    assignedTasks: [],
  },
  {
    id: '2',
    name: 'Nicholas A. Hoult',
    empId: 'EMP002',
    tenure: 'Senior staff',
    assignedTasks: [],
  },
  {
    id: '3',
    name: 'Mariah Carey',
    empId: 'EMP003',
    tenure: 'Mid-level',
    assignedTasks: [],
  },
  {
    id: '4',
    name: 'Joshua Ullimer A. Demerin',
    empId: 'EMP004',
    tenure: 'Junior staff',
    assignedTasks: [],
  },
  {
    id: '5',
    name: 'Damon Albarn',
    empId: 'EMP005',
    tenure: 'Senior staff',
    assignedTasks: [],
  },
  {
    id: '6',
    name: 'José Protacio Rizal Mercado y Alonso',
    empId: 'EMP006',
    tenure: 'Manager',
    assignedTasks: [],
  },
];
