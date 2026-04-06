/**
 * WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test scope: Remote integration tests for employee profile actions and profile action handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/profile.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  createProfilePictureFile,
  employeeProfileUpdateInput,
} from '../../mockData/employeeProfileMockData';
import {
  deleteOwnProfilePictureHandler,
  fetchUserProfileByIdHandler,
  updateOwnProfileHandler,
  uploadOwnProfilePictureHandler,
} from '@/action-handlers/shared/profile';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('employee-profile');

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeEach(() => {
  // Reset toast assertions for each remote profile scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(async () => {
  // Remove all seeded remote rows and storage objects after each test.
  await remoteContext.cleanup();
});

describe('When the employee loads their remote profile', () => {
  test('Then the fetchUserProfileByIdHandler returns the seeded remote user record', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Profile Integration Employee',
      emailPrefix: 'profile.integration.employee',
      contactNumber: '09123456789',
      address: 'Integration Kitchen Street',
      points: 12,
      xp: 4,
      totalPointsEarned: 12,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await fetchUserProfileByIdHandler(employee.id);

    expect(result?.id).toBe(employee.id);
    expect(result?.email).toBe(employee.email);
    expect(result?.name).toBe(employee.name);
  });
});

describe('When the employee updates their remote profile', () => {
  test('Then the updateOwnProfileHandler persists the editable fields in the remote database', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Profile Update Employee',
      emailPrefix: 'profile.update.employee',
      contactNumber: '09120000001',
      address: 'Original Integration Address',
      points: 5,
      xp: 1,
      totalPointsEarned: 5,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const handlerResult = await updateOwnProfileHandler(employeeProfileUpdateInput);
    const { data: updatedRow, error } = await remoteContext.admin
      .from('User')
      .select('name, contact_details, home_address')
      .eq('id', employee.id)
      .single();

    expect(error).toBeNull();
    expect(handlerResult?.error).toBeNull();
    expect(updatedRow?.name).toBe(employeeProfileUpdateInput.name);
    expect(updatedRow?.contact_details).toBe(employeeProfileUpdateInput.contactNumber);
    expect(updatedRow?.home_address).toBe(employeeProfileUpdateInput.address);
    expect(toastSuccess).toHaveBeenCalledWith('Profile updated successfully');
  });
});

describe('When the employee manages their remote profile picture', () => {
  test('Then the uploadOwnProfilePictureHandler stores the file remotely and the deleteOwnProfilePictureHandler removes it', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Profile Picture Employee',
      emailPrefix: 'profile.picture.employee',
      points: 1,
      xp: 0,
      totalPointsEarned: 1,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const uploadResult = await uploadOwnProfilePictureHandler(createProfilePictureFile());
    remoteContext.trackStorageObject('employees', `${employee.id}/profile.png`);

    const { data: storedFiles, error: listError } = await remoteContext.admin.storage
      .from('employees')
      .list(employee.id);

    expect(uploadResult?.error).toBeNull();
    expect(listError).toBeNull();
    expect(storedFiles?.some((file) => file.name === 'profile.png')).toBe(true);

    const deleteResult = await deleteOwnProfilePictureHandler();
    const { data: remainingFiles, error: secondListError } = await remoteContext.admin.storage
      .from('employees')
      .list(employee.id);

    expect(deleteResult).toBe(true);
    expect(secondListError).toBeNull();
    expect(remainingFiles?.some((file) => file.name === 'profile.png')).toBe(false);
    expect(toastSuccess).toHaveBeenCalledWith('Profile picture uploaded successfully');
    expect(toastSuccess).toHaveBeenCalledWith('Profile picture removed successfully');
  });
});
