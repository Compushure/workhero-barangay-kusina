/**
 * WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test scope: Remote integration tests for manager badge editor actions and handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/badge-editor.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  addBadgeInputMockData,
  createBadgeImageFile,
  editBadgeInputMockData,
} from '../../mockData/managerBadgeEditorMockData';
import {
  handleAddBadge,
  handleDeleteBadge,
  handleDeleteBadgeImage,
  handleEditBadge,
  handleFetchBadgeTaskOptions,
  handleFetchBadges,
  handleUploadBadgeImage,
} from '@/action-handlers/manager/badges';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-badge-editor');

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
  // Reset toast assertions before each remote badge-editor scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(async () => {
  // Clear seeded badges, requirements, storage objects, and users.
  await remoteContext.cleanup();
});

describe('When the manager loads remote badge editor data', () => {
  test('Then the badge editor handlers return the seeded KPI category and badge records from the remote database', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Badge Editor Manager',
      emailPrefix: 'badge.editor.manager',
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Badge Editor Category',
      description: 'Remote category for badge editor integration',
    });
    const badge = await remoteContext.seedBadge({
      createdBy: manager.id,
      namePrefix: 'Fetched Remote Badge',
      conditions: [
        {
          requirement_type: 'task',
          requirement_operator: '>=',
          requirement_attrb_id: category.id,
          requirement_attrb_value: 1,
        },
      ],
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const taskOptions = await handleFetchBadgeTaskOptions();
    const badges = await handleFetchBadges();

    expect(taskOptions.some((option) => option.id === category.id)).toBe(true);
    expect(badges.some((row) => row.id === badge.id)).toBe(true);
    expect(badges.find((row) => row.id === badge.id)?.created_by_name).toBe(manager.name);
  });
});

describe('When the manager manages a remote badge', () => {
  test('Then the badge editor handlers create, update, upload, clear, and delete the remote badge cleanly', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Badge Lifecycle Manager',
      emailPrefix: 'badge.lifecycle.manager',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const createdBadge = await handleAddBadge({
      ...addBadgeInputMockData,
      name: `${addBadgeInputMockData.name} ${Date.now()}`,
    });

    expect(createdBadge?.id).toBeTruthy();
    remoteContext.trackBadgeId(createdBadge!.id);

    const { data: createdRequirements } = await remoteContext.admin
      .from('BadgeRequirements')
      .select('id')
      .eq('badge_id', createdBadge!.id);

    expect(createdRequirements?.length).toBe(1);

    const updatedBadge = await handleEditBadge(
      createdBadge!.id,
      {
        ...editBadgeInputMockData,
        name: `${editBadgeInputMockData.name} ${Date.now()}`,
      },
      { suppressToast: true }
    );

    expect(updatedBadge?.name).toContain(editBadgeInputMockData.name);

    const uploadedImageUrl = await handleUploadBadgeImage(
      createdBadge!.id,
      createBadgeImageFile()
    );
    remoteContext.trackStorageObject('badges', `${createdBadge!.id}/badge.png`);

    const { data: uploadedFiles, error: storageListError } = await remoteContext.admin.storage
      .from('badges')
      .list(createdBadge!.id);

    expect(uploadedImageUrl).toContain(createdBadge!.id);
    expect(storageListError).toBeNull();
    expect(uploadedFiles?.some((file) => file.name === 'badge.png')).toBe(true);

    const removedImage = await handleDeleteBadgeImage(createdBadge!.id);
    const { data: badgeAfterImageDelete, error: badgeReloadError } = await remoteContext.admin
      .from('Badges')
      .select('img_link')
      .eq('id', createdBadge!.id)
      .single();

    expect(removedImage).toBe(true);
    expect(badgeReloadError).toBeNull();
    expect(badgeAfterImageDelete?.img_link).toBeNull();

    const removedBadge = await handleDeleteBadge(createdBadge!.id);
    const { data: deletedBadge } = await remoteContext.admin
      .from('Badges')
      .select('id')
      .eq('id', createdBadge!.id)
      .maybeSingle();

    expect(removedBadge).toBe(true);
    expect(deletedBadge).toBeNull();
  });
});
