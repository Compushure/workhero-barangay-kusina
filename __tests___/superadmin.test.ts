/**
 * ⚠️REMEMBER TO BE CAREFUL WITH INTEGRATION TESTING!!!!
 * ‼️‼️PLEASE - if possible comment out nyo danay until ma set up ang test db
 * SuperAdmin User Management Tests
 * ===================================
 * Comprehensive test suite for user creation, editing, and deletion.
 * Tests both happy paths (success scenarios) and sad paths (error scenarios).
 * 
 * Test Coverage: ()
 * - User creation with validation
 * - Email duplicate prevention
 * - User editing with partial updates
 * - User deletion with cascade
 * - User filtering and pagination
 * - Password change functionality
 * - Profile picture management
 */

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';

process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3008';

import { POST as addUserHandler } from '@/app/admin/tools/adduser/route';
import { POST as changePasswordHandler } from '@/app/admin/tools/changepw/route';
import { DELETE as deleteUserHandler } from '@/app/admin/tools/deluser/route';
import { GET as filterUsersHandler } from '@/app/admin/tools/filter/route';
import {
  fetchUsersAction,
  fetchUsersPaginatedAction,
  addUserAction,
  editUserAction,
  deleteUserAction,
  uploadProfilePicture,
  deleteProfilePicture,
} from '@/actions/superadmin/users';
import type { AddUserInput, EditUserInput, User } from '@/types';

// In-memory DB for API/route and integration tests
const memDb = {
  users: [] as Array<{ id: string; email: string; name: string; role_id?: string; employment_status?: string; contact_details?: string; home_address?: string; tin_id?: string; sss_id?: string; pagibig_id?: string; employee_id?: string; date_added?: string }>,
  roles: [
    { id: 'role-superadmin', type: 'superadmin' },
    { id: 'role-manager', type: 'manager' },
    { id: 'role-hr', type: 'hr' },
    { id: 'role-regular', type: 'regular' },
  ],
  userAttributes: [] as Array<{ user_id: string; user_name: string; user_email: string; role_type: string; user_date_added: string; employee_id?: string; contact_details?: string; home_address?: string; tin_id?: string; sss_id?: string; employment_status?: string; pagibig_id?: string }>,
};

type StorageListResult = { data: Array<{ name: string }> | null; error: { message?: string } | null };
type StorageRemoveResult = { data: null; error: { message?: string } | null };
type RpcResult<T = any> = { data: T | null; error: { message: string } | null };
type FetchResponseMock = { ok: boolean; statusText?: string; json: () => Promise<any> };

const mockRpc = jest.fn() as jest.MockedFunction<(fn: string, args?: any) => Promise<RpcResult>>;
const mockList = jest.fn() as jest.MockedFunction<() => Promise<StorageListResult>>;
const mockRemove = jest.fn() as jest.MockedFunction<() => Promise<StorageRemoveResult>>;
const mockGetPublicUrl = jest.fn() as jest.MockedFunction<(path: string) => { data: { publicUrl: string } }>;
const mockFrom = jest.fn(() => ({ list: mockList, remove: mockRemove, getPublicUrl: mockGetPublicUrl }));
const mockSupabase = {
  rpc: mockRpc,
  storage: { from: mockFrom },
};

let supabaseClientMock: any = mockSupabase;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => supabaseClientMock),
}));

jest.mock('@/lib/supabase/admin');
const mockSupabaseAdminModule = jest.requireMock('@/lib/supabase/admin') as { supabaseAdmin?: any };
const mockSupabaseAdmin = mockSupabaseAdminModule.supabaseAdmin || (mockSupabaseAdminModule.supabaseAdmin = {});

mockSupabaseAdmin.auth = {
  admin: {
    createUser: jest.fn(async ({ email, user_metadata }: { email: string; user_metadata?: any }) => {
      const newUser = { id: `auth-${memDb.users.length + 1}`, email, user_metadata };
      return { data: { user: newUser }, error: null };
    }),
    deleteUser: jest.fn(async () => ({ data: null, error: null })),
    updateUserById: jest.fn(async () => ({ data: null, error: null })),
  },
};

mockSupabaseAdmin.from = jest.fn((table: string) => {
  if (table === 'Role') {
    return {
      select: () => ({
        eq: (_field: string, value: string) => ({
          limit: () => ({
            maybeSingle: async () => {
              const row = memDb.roles.find((r) => r.type === value) || null;
              return { data: row ? { id: row.id } : null, error: null };
            },
          }),
        }),
      }),
    };
  }

  if (table === 'User') {
    const api = {
      select: () => ({
        eq: (_field: string, value: string) => ({
          limit: () => ({
            maybeSingle: async () => {
              const row = memDb.users.find((u) => u.email === value) || null;
              return { data: row, error: null };
            },
          }),
        }),
      }),
      insert: (rows: any[]) => {
        const row = { ...rows[0] };
        memDb.users.push(row);
        return {
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: row, error: null }),
            }),
          }),
        } as any;
      },
      delete: () => ({
        eq: (_field: string, value: string) => {
          const idx = memDb.users.findIndex((u) => u.id === value);
          if (idx === -1) return { data: null, error: { message: 'not found' } };
          const removed = memDb.users.splice(idx, 1);
          return { data: removed, error: null };
        },
      }),
    };
    return api as any;
  }

  return {} as any;
});

const resetMemDb = () => {
  memDb.users.splice(0, memDb.users.length);
  memDb.userAttributes.splice(0, memDb.userAttributes.length);
};

beforeAll(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  process.env.SUPABASE_URL = 'http://localhost:54321';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3008';
});

const VALID_USER: AddUserInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePass123',
  employeeType: 'regular',
  employmentStatus: 'regular',
  employeeId: 'EMP001',
  contactNumber: '09123456789',
  address: '123 Main St, Manila',
  tin: '123456789',
  sss: '1234567890',
  pagibig: '123456789012',
};

const EDIT_INPUT: EditUserInput = {
  name: 'Jane Doe',
  employeeType: 'manager',
  employmentStatus: 'probational',
  contactNumber: '09999999999',
  address: '456 New St',
  tin: '987654321',
  sss: '0987654321',
  pagibig: '210987654321',
};

type FetchMock = (input: RequestInfo | URL, init?: RequestInit) => Promise<any>;
const mockFetch = jest.fn() as jest.MockedFunction<FetchMock>;
const realFetch = global.fetch;
const realNow = Date.now;
let useRouteFetch = false;

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = useRouteFetch ? routeFetch : mockFetch;
  Date.now = () => 1700000000000;
  mockList.mockResolvedValue({ data: [{ name: 'profile.png' }], error: null });
  mockRemove.mockResolvedValue({ data: null, error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/employees/profile.png' } });
  mockRpc.mockResolvedValue({ data: { id: 'user-1', name: 'Jane Doe' }, error: null });
});
afterAll(() => {
  global.fetch = realFetch as any;
  Date.now = realNow;
});

/**UNIT TESTING - MOCKED SERVER ACTIONS */

describe('fetchUsersAction', () => {
  test('returns users when fetch succeeds', async () => {
    const users: User[] = [{
      id: 'u1',
      name: 'User One',
      email: 'u1@example.com',
      employeeType: 'regular',
      date_added: new Date(),
    }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users }),
    });

    const result = await fetchUsersAction();
    expect(result).toEqual(users);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/tools/filter'), { method: 'GET' });
  });

  test('throws when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Server error' });
    await expect(fetchUsersAction()).rejects.toThrow('Server error');
  });
});

describe('fetchUsersPaginatedAction', () => {
  test('returns paginated data on success', async () => {
    const users: User[] = [{
      id: 'u1',
      name: 'User One',
      email: 'u1@example.com',
      employeeType: 'regular',
      date_added: new Date(),
    }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users }),
    });

    const result = await fetchUsersPaginatedAction({ page: 1, pageSize: 10 });
    expect(result.error).toBeNull();
    expect(result.data?.data).toEqual(users);
    expect(result.data?.count).toBe(1);
    expect(result.data?.totalPages).toBe(1); // estimated as page because length < pageSize
  });

  test('returns error when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network fail'));
    const result = await fetchUsersPaginatedAction();
    expect(result.error).toContain('network fail');
    expect(result.data).toBeUndefined();
  });
});

describe('addUserAction', () => {
  test('rejects invalid input (email)', async () => {
    const bad: AddUserInput = { ...VALID_USER, email: 'not-an-email' };
    const result = await addUserAction(bad);
    expect(result.error).toContain('Invalid email address');
  });

  test('creates user when backend succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        error: null,
        user: { id: 'auth-1', email: VALID_USER.email },
        userRow: { id: 'auth-1', name: VALID_USER.name, date_added: new Date().toISOString() },
      }),
    });

    const result = await addUserAction(VALID_USER);
    expect(result.error).toBeNull();
    expect(result.data?.email).toBe(VALID_USER.email);
  });

  test('returns error when backend returns error', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ error: 'duplicate' }) });
    const result = await addUserAction(VALID_USER);
    expect(result.error).toContain('Failed to create user');
    expect(result.data).toBeUndefined();
  });
});

describe('editUserAction', () => {
  test('rejects invalid input', async () => {
    const bad: EditUserInput = { ...EDIT_INPUT, name: 'a' };
    const result = await editUserAction('user-1', bad);
    expect(result.error).toContain('Name must be at least 2 characters');
  });

  test('updates user via rpc when valid', async () => {
    mockRpc.mockResolvedValueOnce({ data: { id: 'user-1', name: 'Jane Doe' }, error: null });
    const result = await editUserAction('user-1', EDIT_INPUT);
    expect(result.error).toBeNull();
    expect(mockRpc).toHaveBeenCalledWith('rpc_update_user_name_and_assign_role', expect.objectContaining({ p_user_id: 'user-1' }));
  });

  test('changes password before rpc when provided', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ error: null }) });
    mockRpc.mockResolvedValueOnce({ data: { id: 'user-1', name: 'Jane Doe' }, error: null });
    const result = await editUserAction('user-1', { ...EDIT_INPUT, password: 'NewPass123' });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/tools/changepw'), expect.objectContaining({ method: 'POST' }));
    expect(mockRpc).toHaveBeenCalled();
  });

  test('propagates rpc error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'rpc failed' } });
    const result = await editUserAction('user-1', EDIT_INPUT);
    expect(result.error).toContain('rpc failed');
  });
});

describe('deleteUserAction', () => {
  test('deletes user and profile picture', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ error: null }) });
    mockRemove.mockResolvedValueOnce({ data: null, error: null });
    const result = await deleteUserAction('user-1');
    expect(result.error).toBeNull();
    expect(mockRemove).toHaveBeenCalledWith(['user-1/profile.png']);
  });

  test('returns error when profile removal fails', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ error: null }) });
    mockRemove.mockResolvedValueOnce({ data: null, error: { message: 'storage fail' } });
    const result = await deleteUserAction('user-1');
    expect(result.error).toContain('storage fail');
  });
});

describe('uploadProfilePicture', () => {
  test('returns public URL when file exists', async () => {
    const result = await uploadProfilePicture('user-1', 'profile.png');
    expect(result.error).toBeNull();
    expect(result.data?.publicUrl).toContain('cdn');
    expect(result.data?.publicUrl).toContain('?t=1700000000000');
    expect(mockList).toHaveBeenCalledWith('user-1', { limit: 1, search: 'profile.png' });
  });

  test('fails when file missing', async () => {
    mockList.mockResolvedValueOnce({ data: [], error: null });
    const result = await uploadProfilePicture('user-1', 'profile.png');
    expect(result.error).toContain('verification failed');
  });
});

describe('deleteProfilePicture', () => {
  test('removes picture successfully', async () => {
    mockRemove.mockResolvedValueOnce({ data: null, error: null });
    const result = await deleteProfilePicture('user-1');
    expect(result.error).toBeNull();
    expect(mockRemove).toHaveBeenCalledWith(['user-1/profile.png']);
  });

  test('returns error on storage failure', async () => {
    mockRemove.mockResolvedValueOnce({ data: null, error: { message: 'remove fail' } });
    const result = await deleteProfilePicture('user-1');
    expect(result.error).toContain('remove fail');
  });
});

// Helpers for route and integration tests
const buildUserAttributesFromUsers = () => {
  memDb.userAttributes.splice(0, memDb.userAttributes.length, ...memDb.users.map((u) => {
    const role = memDb.roles.find((r) => r.id === u.role_id) || memDb.roles.find((r) => r.type === 'regular');
    return {
      user_id: u.id,
      user_name: u.name,
      user_email: u.email,
      role_type: role?.type ?? 'regular',
      user_date_added: u.date_added ?? new Date().toISOString(),
      employee_id: u.employee_id,
      contact_details: u.contact_details,
      home_address: u.home_address,
      tin_id: u.tin_id,
      sss_id: u.sss_id,
      employment_status: u.employment_status,
      pagibig_id: u.pagibig_id,
    };
  }));
};

const makeFilterClient = () => ({
  from: (table: string) => {
    if (table !== 'user_attributes') throw new Error('Unexpected table ' + table);
    let data = [...memDb.userAttributes] as Array<Record<string, any>>;
    const query = {
      select: () => query,
      order: (col: string, opts: { ascending: boolean }) => {
        data.sort((a: any, b: any) => (a[col] > b[col] ? 1 : -1) * (opts.ascending ? 1 : -1));
        return query;
      },
      eq: (field: string, value: string) => {
        data = data.filter((row) => row[field] === value);
        return query;
      },
      ilike: (field: string, pattern: string) => {
        const prefix = pattern.replace(/[%_]/g, '').toLowerCase();
        data = data.filter((row) => String(row[field]).toLowerCase().startsWith(prefix));
        return query;
      },
      range: (from: number, to: number) => ({ data: data.slice(from, to + 1), error: null }),
    } as any;
    return query;
  },
});

const routeFetch = async (url: string, init?: RequestInit) => {
  const target = new URL(url, 'http://localhost:3008');
  if (target.pathname.includes('/admin/tools/adduser')) {
    const res = await addUserHandler(new Request(url, init));
    return { status: res.status, ok: res.status < 400, json: () => res.json() } as any;
  }
  if (target.pathname.includes('/admin/tools/changepw')) {
    const res = await changePasswordHandler(new Request(url, init as any) as any);
    return { status: res.status, ok: res.status < 400, json: () => res.json() } as any;
  }
  if (target.pathname.includes('/admin/tools/deluser')) {
    const res = await deleteUserHandler(new Request(url, init));
    return { status: res.status, ok: res.status < 400, json: () => res.json() } as any;
  }
  if (target.pathname.includes('/admin/tools/filter')) {
    buildUserAttributesFromUsers();
    supabaseClientMock = makeFilterClient();
    const res = await filterUsersHandler(new Request(url, init));
    supabaseClientMock = mockSupabase;
    return { status: res.status, ok: res.status < 400, json: () => res.json() } as any;
  }
  throw new Error('Unhandled route: ' + url);
};

/**
 * ============================================
 * TEST SUITE: API TESTING (route.ts)
 * ============================================
 */

describe('API Routes', () => {
  beforeEach(() => {
    resetMemDb();
    supabaseClientMock = mockSupabase;
    (global as any).fetch = routeFetch;
  });

  describe('adduser route', () => {
    test('creates user and writes to memDb', async () => {
      const req = new Request('http://localhost:3008/admin/tools/adduser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'api.user@example.com',
          password: 'SecurePass123',
          name: 'API User',
          requested_role: 'regular',
          employee_id: 'API001',
        }),
      });
      const res = await addUserHandler(req);
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.user.email).toBe('api.user@example.com');
      expect(memDb.users).toHaveLength(1);
    });

    test('rejects duplicate email', async () => {
      memDb.users.push({ id: 'auth-1', email: 'dup@example.com', name: 'Dup', date_added: new Date().toISOString() });
      const req = new Request('http://localhost:3008/admin/tools/adduser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dup@example.com', password: 'SecurePass123', name: 'Dup2', requested_role: 'regular' }),
      });
      const res = await addUserHandler(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error.toLowerCase()).toContain('already exists');
      expect(memDb.users).toHaveLength(1);
    });
  });

  describe('changepw route', () => {
    test('updates password with valid input', async () => {
      const req = new Request('http://localhost:3008/admin/tools/changepw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'auth-1', new_password: 'NewPass123' }),
      });
      const res = await changePasswordHandler(req as any);
      expect(res.status).toBe(200);
      expect(mockSupabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('auth-1', { password: 'NewPass123' });
    });

    test('rejects short password', async () => {
      const req = new Request('http://localhost:3008/admin/tools/changepw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'auth-1', new_password: '123' }),
      });
      const res = await changePasswordHandler(req as any);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toContain('Invalid password');
    });
  });

  describe('deluser route', () => {
    test('deletes existing user', async () => {
      memDb.users.push({ id: 'auth-1', email: 'delete@example.com', name: 'Del User' });
      const req = new Request('http://localhost:3008/admin/tools/deluser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: 'auth-1' }),
      });
      const res = await deleteUserHandler(req);
      expect(res.status).toBe(200);
      expect(memDb.users).toHaveLength(0);
    });

    test('returns error when user missing', async () => {
      const req = new Request('http://localhost:3008/admin/tools/deluser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: 'nope' }),
      });
      const res = await deleteUserHandler(req);
      const data = await res.json();
      expect(res.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('filter route', () => {
    test('filters by role and paginates', async () => {
      memDb.users.push({ id: 'u1', email: 'a@example.com', name: 'Alpha', role_id: 'role-regular', date_added: new Date('2024-01-01').toISOString() });
      memDb.users.push({ id: 'u2', email: 'b@example.com', name: 'Beta', role_id: 'role-manager', date_added: new Date('2024-02-01').toISOString() });
      buildUserAttributesFromUsers();
      supabaseClientMock = makeFilterClient();
      const url = 'http://localhost:3008/admin/tools/filter?employeeType=manager&type=name&order=asc&page=1&pageSize=10';
      const res = await filterUsersHandler(new Request(url));
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.users).toHaveLength(1);
      expect(data.users[0].name).toBe('Beta');
      supabaseClientMock = mockSupabase;
    });
  });
});

/**
 * ============================================
 * TEST SUITE: INTEGRATION (actions + routes)
 * ============================================
 */

describe('Integration - Actions with real route handlers (in-memory DB)', () => {
  const realFetchLocal = global.fetch;

  beforeAll(() => {
    (global as any).fetch = routeFetch;
  });

  afterAll(() => {
    global.fetch = realFetchLocal as any;
  });

  beforeEach(() => {
    resetMemDb();
    supabaseClientMock = mockSupabase;
    (global as any).fetch = routeFetch;
  });

  afterEach(() => {
    resetMemDb();
  });

  test('completes lifecycle: create -> fetch -> delete with cleanup', async () => {
    const createResult = await addUserAction(VALID_USER);
    expect(createResult.error).toBeNull();
    expect(memDb.users).toHaveLength(1);

    const list = await fetchUsersAction();
    expect(list).toHaveLength(1);
    expect(list[0].email).toBe(VALID_USER.email);

    const delResult = await deleteUserAction(memDb.users[0].id);
    expect(delResult.error).toBeNull();
    expect(memDb.users).toHaveLength(0);
  });

  test('prevents duplicate emails end-to-end', async () => {
    const first = await addUserAction(VALID_USER);
    expect(first.error).toBeNull();
    const second = await addUserAction({ ...VALID_USER, name: 'Dup User' });
    expect(second.error?.toLowerCase()).toContain('failed to create user');
    expect(memDb.users).toHaveLength(1);
  });

  test('maintains consistency across edit then delete', async () => {
    await addUserAction(VALID_USER);
    const editResult = await editUserAction(memDb.users[0].id, EDIT_INPUT);
    expect(editResult.error).toBeNull();
    const delResult = await deleteUserAction(memDb.users[0].id);
    expect(delResult.error).toBeNull();
    expect(memDb.users).toHaveLength(0);
  });
});

/**
 * ============================================
 * TEST SUITE: ERROR HANDLING & EDGE CASES
 * ============================================
 */

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    resetMemDb();
    supabaseClientMock = mockSupabase;
  });

  test('adduser route handles malformed JSON', async () => {
    const badReq = new Request('http://localhost:3008/admin/tools/adduser', {
      method: 'POST',
      body: 'not-json',
    });
    const res = await addUserHandler(badReq);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  test('addUserAction rejects whitespace-only name via zod', async () => {
    const result = await addUserAction({ ...VALID_USER, name: ' ' });
    expect(result.error?.toLowerCase()).toContain('name');
  });

  test('editUserAction rejects long address', async () => {
    const longAddress = 'a'.repeat(251);
    const result = await editUserAction('user-1', { ...EDIT_INPUT, address: longAddress });
    expect(result.error?.toLowerCase()).toContain('address');
  });
});