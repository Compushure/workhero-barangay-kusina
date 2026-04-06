/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch remote employee points and XP data
 * - Fetch remote level metadata and XP thresholds
 * - Adjust remote XP for level progression
 * - Verify the matching remote action handlers for employee stats
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/employee-stats.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleAdjustActiveUserXPByDelta,
  handleFetchAllLevelMetadata,
  handleFetchEmployeePoints,
  handleFetchEmployeeXP,
  handleFetchXPRequiredForNextLevel,
} from '@/action-handlers/employee/stats';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

const remoteContext = new RemoteSupabaseTestContext('employee-stats');

let currentServerClient: typeof remoteContext.admin = remoteContext.admin;

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
  };
};

beforeEach(() => {
  // Reset toast assertions before each remote stats scenario.
  toast.success.mockReset();
  toast.error.mockReset();
});

afterEach(async () => {
  // Remove seeded users and let user deletion cascade clean related rows.
  await remoteContext.cleanup();
});

describe('When the employee reads remote points and XP data', () => {
  test('Then the employee stats handlers return the seeded points, XP, and level metadata from the remote database', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Stats Reader',
      emailPrefix: 'employee.stats.reader',
      points: 75,
      xp: 20,
      level: 2,
      totalPointsEarned: 150,
    });

    await remoteContext.admin
      .from('User')
      .update({
        deducted_points: 5,
        total_xp: 120,
      })
      .eq('id', employee.id);

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const points = await handleFetchEmployeePoints();
    const xp = await handleFetchEmployeeXP();
    const xpRequired = await handleFetchXPRequiredForNextLevel(2);
    const levelMetadata = await handleFetchAllLevelMetadata();

    expect(points).toEqual({ points: 75, deductedPoints: 5 });
    expect(xp).toEqual({
      currentXP: 20,
      totalXP: 120,
      level: 2,
    });
    expect(xpRequired).toBeGreaterThan(0);
    expect(levelMetadata?.length).toBeGreaterThan(0);
  });
});

describe('When the employee adjusts remote XP for level progression', () => {
  test('Then the employee stats handler updates the remote XP, total XP, and level fields using the remote level thresholds', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Stats Leveler',
      emailPrefix: 'employee.stats.leveler',
      points: 40,
      xp: 20,
      level: 2,
      totalPointsEarned: 40,
    });

    await remoteContext.admin
      .from('User')
      .update({
        total_xp: 120,
      })
      .eq('id', employee.id);

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const updatedXP = await handleAdjustActiveUserXPByDelta(210);
    const { data: updatedUserRow, error } = await remoteContext.admin
      .from('User')
      .select('xp, level, total_xp')
      .eq('id', employee.id)
      .single();

    expect(updatedXP).toEqual({
      level: 3,
      xp: 130,
      totalXP: 330,
    });
    expect(error).toBeNull();
    expect(updatedUserRow).toEqual(
      expect.objectContaining({
        xp: 130,
        level: 3,
        total_xp: 330,
      })
    );
    expect(toast.error).not.toHaveBeenCalled();
  });
});
