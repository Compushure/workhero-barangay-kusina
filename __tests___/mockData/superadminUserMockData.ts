import type { AddUserInput, EditUserInput, User } from '@/types';

export const addUserInputMockData: AddUserInput = {
  name: 'Superadmin Added User',
  email: 'superadmin.added.user@example.com',
  password: 'SecurePass123',
  employeeType: 'regular',
  employmentStatus: 'regular',
  employeeId: 'EMP-SUPERADMIN-001',
  contactNumber: '09123456789',
  address: '123 Admin Street',
  tin: '123456789',
  sss: '1234567890',
  pagibig: '123456789012',
};

export const editUserInputMockData: EditUserInput = {
  name: 'Updated Managed User',
  employeeType: 'manager',
  employmentStatus: 'probational',
  contactNumber: '09999888777',
  address: '456 Managed Street',
  tin: '987654321',
  sss: '0987654321',
  pagibig: '210987654321',
};

export const expectedManagedUserMockData: User = {
  id: 'user-1',
  name: addUserInputMockData.name,
  email: addUserInputMockData.email,
  employeeType: addUserInputMockData.employeeType,
  date_added: new Date('2026-04-02T10:00:00.000Z'),
  createdAt: new Date('2026-04-02T10:00:00.000Z'),
  employmentStatus: addUserInputMockData.employmentStatus,
  contactNumber: addUserInputMockData.contactNumber,
  address: addUserInputMockData.address,
  employeeId: addUserInputMockData.employeeId,
  tin: addUserInputMockData.tin,
  sss: addUserInputMockData.sss,
  pagibig: addUserInputMockData.pagibig,
};
