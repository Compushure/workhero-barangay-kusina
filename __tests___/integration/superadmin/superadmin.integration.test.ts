/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Create, edit, and delete remote users
 * - Filter and paginate remote users through the admin route
 * - Change passwords through the admin route
 * - Upload and delete remote profile pictures
 * - Verify the matching remote superadmin action and route handlers
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/superadmin/superadmin.integration.test.ts
 */

import { afterAll, afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextRequest } from 'next/server';

import { createProfilePictureFile } from '../../mockData/employeeProfileMockData';
import {
  addUserInputMockData,
  editUserInputMockData,
} from '../../mockData/superadminUserMockData';
import { POST as addUserRoute } from '@/app/admin/tools/adduser/route';
import { POST as changePasswordRoute } from '@/app/admin/tools/changepw/route';
import { DELETE as deleteUserRoute } from '@/app/admin/tools/deluser/route';
import { GET as filterUsersRoute } from '@/app/admin/tools/filter/route';
import {
  addUserAction,
  deleteProfilePicture,
  deleteUserAction,
  editUserAction,
  fetchUsersAction,
  fetchUsersPaginatedAction,
  uploadProfilePicture,
} from '@/actions/superadmin/users';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { findExistingUserEmail } from '@/lib/users/email-availability';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

type WelcomeEmailModule = typeof import('@/lib/smtp/welcome-email');
type SendWelcomeEmailParams = Parameters<WelcomeEmailModule['sendWelcomeEmail']>[0];
type GenerateLinkResponse = Awaited<ReturnType<typeof supabaseAdmin.auth.admin.generateLink>>;

const remoteContext = new RemoteSupabaseTestContext('superadmin-users');
let currentServerClient: typeof remoteContext.admin = remoteContext.admin;
let generateLinkSpy: { mockRestore: () => void } | null = null;
const realFetch = global.fetch;

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('@/lib/smtp/welcome-email', () => {
  const actual = jest.requireActual('@/lib/smtp/welcome-email') as WelcomeEmailModule;
  return {
    ...actual,
    // Prevent SMTP delivery during the remote DB flow.
    sendWelcomeEmail: jest.fn(async (params: SendWelcomeEmailParams) => {
      void params;
    }),
  };
});

const { sendWelcomeEmail } = jest.requireMock('@/lib/smtp/welcome-email') as {
  sendWelcomeEmail: jest.MockedFunction<
    (params: SendWelcomeEmailParams) => Promise<void>
  >;
};
const sendWelcomeEmailMock = sendWelcomeEmail;

function buildRouteResponse(response: Response): Response {
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText || `${response.status}`,
    json: async () => response.json(),
  } as Response;
}

// Normalizes RequestInit so it can be passed into NextRequest in tests.
function buildNextRequestInit(init?: RequestInit) {
  if (!init) {
    return { method: 'POST' };
  }

  return {
    ...init,
    signal: init.signal ?? undefined,
  };
}

// Routes internal action fetches back into the app's admin route handlers.
const routeFetch: typeof fetch = async (input, init) => {
  const url =
    typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
  const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3008';
  const target = new URL(url, appBaseUrl);
  const appOrigin = new URL(appBaseUrl).origin;

  if (target.origin !== appOrigin || !target.pathname.startsWith('/admin/tools/')) {
    return realFetch(input, init);
  }

  // Route internal admin-tool fetches back into the local handlers.
  if (target.pathname.includes('/admin/tools/adduser')) {
    return buildRouteResponse(
      await addUserRoute(
        new Request(target.toString(), init || { method: 'POST' })
      )
    );
  }

  if (target.pathname.includes('/admin/tools/changepw')) {
    return buildRouteResponse(
      await changePasswordRoute(
        new NextRequest(target.toString(), buildNextRequestInit(init))
      )
    );
  }

  if (target.pathname.includes('/admin/tools/deluser')) {
    return buildRouteResponse(
      await deleteUserRoute(
        new Request(target.toString(), init || { method: 'DELETE' })
      )
    );
  }

  if (target.pathname.includes('/admin/tools/filter')) {
    return buildRouteResponse(await filterUsersRoute(new Request(target.toString(), init)));
  }

  throw new Error(`Unhandled route fetch: ${target.pathname}`);
};

function buildUniqueUserInput() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    ...addUserInputMockData,
    name: `${addUserInputMockData.name} ${suffix}`,
    email: `superadmin.user.${suffix}@example.com`,
    employeeId: `EMP-SA-${suffix}`.slice(0, 64),
  };
}

beforeEach(() => {
  // Reset mail and fetch mocks before each remote user-management scenario.
  sendWelcomeEmailMock.mockReset();
  currentServerClient = remoteContext.admin;
  global.fetch = routeFetch;
  // Keep magic-link generation deterministic for the integration flow.
  generateLinkSpy = jest.spyOn(supabaseAdmin.auth.admin, 'generateLink').mockResolvedValue({
    data: {
      properties: {
        hashed_token: 'integration-hash',
        verification_type: 'magiclink',
      },
    },
    error: null,
  } as unknown as GenerateLinkResponse);
});

afterEach(async () => {
  generateLinkSpy?.mockRestore();
  generateLinkSpy = null;
  global.fetch = realFetch;
  // Always clear seeded remote data, even after assertion failures.
  await remoteContext.cleanup();
});

afterAll(() => {
  global.fetch = realFetch;
});

describe('When the superadmin creates and lists a remote user', () => {
  test('Then the user-management actions create the remote user and the list actions return it from the remote filter route', async () => {
    const input = buildUniqueUserInput();

    const createdUser = await addUserAction(input);

    expect(createdUser.error).toBeNull();
    expect(createdUser.data?.id).toBeTruthy();
    expect(sendWelcomeEmailMock).toHaveBeenCalled();

    remoteContext.trackUserId(createdUser.data!.id);

    const listedUsers = await fetchUsersAction({
      searchQuery: input.employeeId,
      searchType: 'employee_id',
      employeeTypeFilter: 'regular',
    });
    const paginatedUsers = await fetchUsersPaginatedAction({
      searchQuery: input.employeeId,
      searchType: 'employee_id',
      page: 1,
      pageSize: 10,
    });

    expect(listedUsers.some((user) => user.id === createdUser.data!.id)).toBe(true);
    expect(paginatedUsers.error).toBeNull();
    expect(paginatedUsers.data?.data.some((user) => user.id === createdUser.data!.id)).toBe(
      true
    );
  });
});

describe('When the superadmin manages a remote user lifecycle', () => {
  test('Then the user-management actions update profile data, verify and remove the remote profile picture, and delete the auth and public user records', async () => {
    const input = buildUniqueUserInput();
    const createdUser = await addUserAction(input);

    expect(createdUser.error).toBeNull();
    remoteContext.trackUserId(createdUser.data!.id);

    const updatedUser = await editUserAction(createdUser.data!.id, {
      ...editUserInputMockData,
      name: `${editUserInputMockData.name} ${Date.now()}`,
      employeeType: 'no-change',
      employmentStatus: 'regular',
    });
    const { data: updatedRow, error: updatedRowError } = await remoteContext.admin
      .from('User')
      .select('name, contact_details, home_address')
      .eq('id', createdUser.data!.id)
      .single();

    expect(updatedUser.error).toBeNull();
    expect(updatedRowError).toBeNull();
    expect(updatedRow?.name).toBeDefined();
    expect(updatedRow?.name).toContain(editUserInputMockData.name);

    await remoteContext.uploadStorageObject(
      'employees',
      `${createdUser.data!.id}/profile.png`,
      createProfilePictureFile()
    );

    const uploadVerification = await uploadProfilePicture(createdUser.data!.id, 'profile.png');
    expect(uploadVerification.error).toBeNull();
    expect(uploadVerification.data?.publicUrl).toContain(createdUser.data!.id);

    const deletedPicture = await deleteProfilePicture(createdUser.data!.id);
    const { data: remainingFiles, error: storageListError } = await remoteContext.admin.storage
      .from('employees')
      .list(createdUser.data!.id);

    expect(deletedPicture.error).toBeNull();
    expect(storageListError).toBeNull();
    expect(remainingFiles?.some((file) => file.name === 'profile.png')).toBe(false);

    const deletedUser = await deleteUserAction(createdUser.data!.id);
    const emailAvailability = await findExistingUserEmail(input.email);
    const { data: publicUserRow } = await remoteContext.admin
      .from('User')
      .select('id')
      .eq('id', createdUser.data!.id)
      .maybeSingle();

    expect(deletedUser.error).toBeNull();
    expect(publicUserRow).toBeNull();
    expect(emailAvailability.exists).toBe(false);
  });
});
