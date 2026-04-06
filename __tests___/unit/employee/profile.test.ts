/**
 * Test coverage:
 * - Fetch an employee profile by ID
 * - Update the employee's own profile
 * - Upload an employee profile picture
 * - Delete an employee profile picture
 * - Verify the matching action handlers for employee profile flows
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/profile.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  createProfilePictureFile,
  employeeAttendanceStatsRow,
  employeeProfileUpdateInput,
  employeeProfileViewRow,
  expectedEmployeeProfile,
} from '../../mockData/employeeProfileMockData';
import {
  deleteOwnProfilePicture,
  fetchUserProfileById,
  updateOwnProfile,
  uploadOwnProfilePicture,
} from '@/actions/shared/profile';
import {
  deleteOwnProfilePictureHandler,
  fetchUserProfileByIdHandler,
  updateOwnProfileHandler,
  uploadOwnProfilePictureHandler,
} from '@/action-handlers/shared/profile';

let mockSupabaseClient: any;

const createClientMock = jest.fn(async () => mockSupabaseClient);
const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => createClientMock(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// Builds the table-specific query stubs used by the profile action.
function createFromBuilder(options: {
  userProfileResult?: { data: any; error: { message: string } | null };
  attendanceResult?: { data: any; error: { message: string } | null };
}) {
  return jest.fn((table: string) => {
    if (table === 'user_attributes') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(async () => options.userProfileResult),
          })),
        })),
      };
    }

    if (table === 'total_attendance_stats_view') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(async () => options.attendanceResult),
          })),
        })),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });
}

// Creates a full mocked Supabase client for profile reads, updates, and storage calls.
function createProfileClient(overrides?: {
  userProfileResult?: { data: any; error: { message: string } | null };
  attendanceResult?: { data: any; error: { message: string } | null };
  sessionResult?: { data: any; error: { message: string } | null };
  rpcResult?: { data: any; error: { message: string } | null };
  uploadResult?: { data: any; error: { message: string } | null };
  removeResult?: { data: any; error: { message: string } | null };
  publicUrl?: string;
}) {
  const sessionResult =
    overrides?.sessionResult || {
      data: {
        session: {
          user: {
            id: employeeProfileViewRow.user_id,
            email: employeeProfileViewRow.user_email,
          },
        },
      },
      error: null,
    };

  return {
    from: createFromBuilder({
      userProfileResult: overrides?.userProfileResult || {
        data: employeeProfileViewRow,
        error: null,
      },
      attendanceResult: overrides?.attendanceResult || {
        data: employeeAttendanceStatsRow,
        error: null,
      },
    }),
    auth: {
      getSession: jest.fn(async () => sessionResult),
    },
    rpc: jest.fn(async () => overrides?.rpcResult || { data: { id: employeeProfileViewRow.user_id }, error: null }),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: {
            publicUrl:
              overrides?.publicUrl ||
              'https://cdn.example.com/employees/user-profile-1/profile.png',
          },
        })),
        upload: jest.fn(async () => overrides?.uploadResult || { data: { path: 'user-profile-1/profile.png' }, error: null }),
        remove: jest.fn(async () => overrides?.removeResult || { data: ['user-profile-1/profile.png'], error: null }),
      })),
    },
  };
}

beforeEach(() => {
  // Reset the client and toast state before each scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
  createClientMock.mockClear();
  mockSupabaseClient = createProfileClient();
});

describe('When the employee loads a profile', () => {
  test('Then the fetchUserProfileById action returns normalized profile details', async () => {
    const result = await fetchUserProfileById(employeeProfileViewRow.user_id);

    expect(result.error).toBeNull();
    expect(result.data).toEqual(expectedEmployeeProfile);
  });

  test('Then the fetchUserProfileById action returns a readable error when the profile is missing', async () => {
    mockSupabaseClient = createProfileClient({
      userProfileResult: {
        data: null,
        error: { message: 'No rows found' },
      },
    });

    const result = await fetchUserProfileById(employeeProfileViewRow.user_id);

    expect(result.error).toContain('Failed to fetch user profile');
    expect(result.data).toBeUndefined();
  });

  test('Then the fetchUserProfileByIdHandler returns null and shows a toast when the action reports an error', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/shared/profile'), 'fetchUserProfileById')
      .mockResolvedValueOnce({ error: 'Profile not found' });

    const result = await fetchUserProfileByIdHandler(employeeProfileViewRow.user_id);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Profile not found');
    actionSpy.mockRestore();
  });
});

describe('When the employee updates their own profile', () => {
  test('Then the updateOwnProfile action sends only the editable profile fields to the RPC', async () => {
    const result = await updateOwnProfile(employeeProfileUpdateInput);

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'rpc_update_user_name_and_assign_role',
      expect.objectContaining({
        p_user_id: employeeProfileViewRow.user_id,
        p_new_name: employeeProfileUpdateInput.name,
        p_contact_details: employeeProfileUpdateInput.contactNumber,
        p_home_address: employeeProfileUpdateInput.address,
        p_role_type: '',
      })
    );
  });

  test('Then the updateOwnProfile action blocks the request when there is no active session', async () => {
    mockSupabaseClient = createProfileClient({
      sessionResult: {
        data: { session: null },
        error: null,
      },
    });

    const result = await updateOwnProfile(employeeProfileUpdateInput);

    expect(result.error).toBe('No active session found');
  });

  test('Then the updateOwnProfileHandler returns null and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/shared/profile'), 'updateOwnProfile')
      .mockResolvedValueOnce({ error: 'Failed to update profile' });

    const result = await updateOwnProfileHandler(employeeProfileUpdateInput);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Failed to update profile');
    actionSpy.mockRestore();
  });
});

describe('When the employee uploads a profile picture', () => {
  test('Then the uploadOwnProfilePicture action stores the file in the employees bucket', async () => {
    const file = createProfilePictureFile();
    const result = await uploadOwnProfilePicture(file);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ path: 'user-profile-1/profile.png' });
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('employees');
  });

  test('Then the uploadOwnProfilePictureHandler returns null and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/shared/profile'), 'uploadOwnProfilePicture')
      .mockResolvedValueOnce({ error: 'Failed to upload profile picture' });

    const result = await uploadOwnProfilePictureHandler(createProfilePictureFile());

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Failed to upload profile picture');
    actionSpy.mockRestore();
  });
});

describe('When the employee removes a profile picture', () => {
  test('Then the deleteOwnProfilePicture action removes the storage object for the current user', async () => {
    const result = await deleteOwnProfilePicture();

    expect(result.error).toBeNull();
    expect(result.data).toEqual(['user-profile-1/profile.png']);
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('employees');
  });

  test('Then the deleteOwnProfilePictureHandler returns false and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/shared/profile'), 'deleteOwnProfilePicture')
      .mockResolvedValueOnce({ error: 'Failed to remove profile picture' });

    const result = await deleteOwnProfilePictureHandler();

    expect(result).toBe(false);
    expect(toastError).toHaveBeenCalledWith('Failed to remove profile picture');
    actionSpy.mockRestore();
  });
});
