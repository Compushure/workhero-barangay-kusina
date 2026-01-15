export type SortOption = 'pending' | 'approved' | 'denied';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface VerificationRequest {
  id: string;
  date: Date;
  employeeName: string;
  employeeId: string;
  task: string;
  repeat: number;
  totalPoints: number;
  status: 'pending' | 'approved' | 'denied';
}
