/**
 * WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test scope: Remote integration tests for manager badge assignment actions and handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/badge-assignment.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleAssignManualBadgeToUser,
  handleFetchAllBadges,
  handleFetchBadgeAssignmentUsers,
  handleFetchBadgeAwardDebugEntries,
  handleFetchManualBadges,
  handleRemoveBadgeAward,
} from '@/action-handlers/manager/badge-assignment';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-badge-assignment');

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
  // Reset toast assertions before each badge-assignment scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(async () => {
  // Remove seeded awards, notifications, badges, and users after each test.
  await remoteContext.cleanup();
});

describe('When the manager loads remote badge assignment data', () => {
  test('Then the badge assignment handlers return the seeded manual badges, all badges, and users with collected badges', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Badge Assignment Manager',
      emailPrefix: 'badge.assignment.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Badge Assignment Employee',
      emailPrefix: 'badge.assignment.employee',
      points: 10,
      xp: 2,
      totalPointsEarned: 10,
    });
    const manualBadge = await remoteContext.seedBadge({
      createdBy: manager.id,
      namePrefix: 'Manual Assignment Badge',
      points: 25,
      awardAtInterval: 'none',
    });
    const automaticBadge = await remoteContext.seedBadge({
      createdBy: manager.id,
      namePrefix: 'Automatic Assignment Badge',
      points: 15,
      awardAtInterval: 'monthly',
    });

    await remoteContext.seedUserBadge({
      badgeId: manualBadge.id,
      awardedTo: employee.id,
      awardedBy: manager.id,
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const manualBadges = await handleFetchManualBadges();
    const allBadges = await handleFetchAllBadges();
    const users = await handleFetchBadgeAssignmentUsers();

    expect(manualBadges.some((badge) => badge.id === manualBadge.id)).toBe(true);
    expect(manualBadges.some((badge) => badge.id === automaticBadge.id)).toBe(false);
    expect(allBadges.some((badge) => badge.id === automaticBadge.id)).toBe(true);
    expect(users.find((user) => user.id === employee.id)?.badge_ids).toContain(manualBadge.id);
  });
});

describe('When the manager awards and removes a remote badge', () => {
  test('Then the badge assignment handlers create the remote award, update user points, create a notification, and remove the award again', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Badge Award Manager',
      emailPrefix: 'badge.award.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Badge Award Employee',
      emailPrefix: 'badge.award.employee',
      points: 10,
      xp: 3,
      totalPointsEarned: 10,
    });
    const manualBadge = await remoteContext.seedBadge({
      createdBy: manager.id,
      namePrefix: 'Awarded Manual Badge',
      points: 30,
      awardAtInterval: 'none',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const awarded = await handleAssignManualBadgeToUser(manualBadge.id, employee.id);
    const { data: awardedBadgeRow, error: awardedBadgeError } = await remoteContext.admin
      .from('UserBadges')
      .select('id')
      .eq('badge_id', manualBadge.id)
      .eq('awarded_to', employee.id)
      .single();
    const { data: employeeAfterAward, error: employeeReloadError } = await remoteContext.admin
      .from('User')
      .select('points, total_points_earned')
      .eq('id', employee.id)
      .single();
    const { data: notificationRows, error: notificationError } = await remoteContext.admin
      .from('Notification')
      .select('id, message')
      .eq('user_id', employee.id)
      .eq('type', 'badge');

    expect(awarded).toBe(true);
    expect(awardedBadgeError).toBeNull();
    expect(employeeReloadError).toBeNull();
    expect(employeeAfterAward?.points).toBe(40);
    expect(employeeAfterAward?.total_points_earned).toBe(40);

    remoteContext.trackUserBadgeId(awardedBadgeRow!.id);
    notificationRows?.forEach((row) => remoteContext.trackNotificationId(row.id));

    expect(notificationError).toBeNull();
    expect(notificationRows?.some((row) => row.message.includes('awarded'))).toBe(true);

    const debugEntries = await handleFetchBadgeAwardDebugEntries();
    expect(debugEntries.some((entry) => entry.id === awardedBadgeRow!.id)).toBe(true);

    const removed = await handleRemoveBadgeAward(awardedBadgeRow!.id);
    const { data: removedAward } = await remoteContext.admin
      .from('UserBadges')
      .select('id')
      .eq('id', awardedBadgeRow!.id)
      .maybeSingle();
    const { data: employeeAfterRemoval, error: employeeAfterRemovalError } =
      await remoteContext.admin
        .from('User')
        .select('points')
        .eq('id', employee.id)
        .single();

    expect(removed).toBe(true);
    expect(removedAward).toBeNull();
    expect(employeeAfterRemovalError).toBeNull();
    expect(employeeAfterRemoval?.points).toBe(10);
  });
});
