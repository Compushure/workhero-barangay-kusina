/**
 * Test coverage:
 * - Task status normalization and chip metadata
 * - Lifecycle derivation for approved-state variants
 * - Overdue helpers and remaining-order edge behavior
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/task-status-utils.test.ts
 */

import { describe, expect, test } from '@jest/globals';

import {
  deriveTaskLifecycleState,
  getTaskBaseStatusChipMeta,
  getTaskRemainingOrders,
  getTaskSectionAccentClassName,
  getTaskSectionStatusChipMeta,
  getTaskSignalChipMeta,
  isTaskStatusItemOverdue,
  normalizeTaskStatus,
} from '@/components/employee/task-status/task-status-utils';
import { createTaskStatusItemMock } from '../../mockData/employeeTaskMockData';

describe('When task statuses are normalized and mapped to chips', () => {
  test('Then normalizeTaskStatus maps supported values and returns null for unknown statuses', () => {
    expect(normalizeTaskStatus('assigned')).toBe('assigned');
    expect(normalizeTaskStatus('in review')).toBe('in review');
    expect(normalizeTaskStatus('approved')).toBe('approved');
    expect(normalizeTaskStatus('rejected')).toBe('rejected');
    expect(normalizeTaskStatus('unknown-status')).toBeNull();
  });

  test('Then status-chip helpers return expected labels for section and fallback cases', () => {
    expect(getTaskBaseStatusChipMeta('approved').label).toBe('Approved');
    expect(getTaskBaseStatusChipMeta('not-real').label).toBe('Task');
    expect(getTaskSectionStatusChipMeta('Current').label).toBe('Current');
    expect(getTaskSectionAccentClassName('Rejected')).toContain('text-[#8b2e22]');
    expect(getTaskSignalChipMeta('claimed').label).toBe('Claimed');
  });
});

describe('When deriving lifecycle state for approved tasks', () => {
  test('Then approved task with remaining and pending orders is unclaimed-with-remaining', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'approved',
        pendingOrders: 2,
        completedOrders: 1,
        maxOrders: 4,
      }),
      false
    );

    expect(state.approvedTaskState).toBe('unclaimed-with-remaining');
    expect(state.isClaimedForCurrentApproval).toBe(false);
    expect(state.hasRemainingOrders).toBe(true);
  });

  test('Then approved task with remaining and no pending orders is claimed-with-remaining', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'approved',
        pendingOrders: 0,
        completedOrders: 2,
        maxOrders: 5,
      }),
      false
    );

    expect(state.approvedTaskState).toBe('claimed-with-remaining');
    expect(state.showClaimedChip).toBe(true);
    expect(state.hasRemainingOrders).toBe(true);
  });

  test('Then approved task with no remaining orders and pending batch is unclaimed-no-remaining', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'approved',
        pendingOrders: 1,
        completedOrders: 3,
        maxOrders: 3,
      }),
      false
    );

    expect(state.approvedTaskState).toBe('unclaimed-no-remaining');
    expect(state.hasNoRemainingOrders).toBe(true);
  });

  test('Then approved claimed task with no remaining orders and no completion timestamp is claimed-no-remaining-unserved', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'approved',
        pendingOrders: 0,
        completedOrders: 3,
        maxOrders: 3,
      }),
      false
    );

    expect(state.approvedTaskState).toBe('claimed-no-remaining-unserved');
    expect(state.showServedChip).toBe(false);
  });

  test('Then approved claimed task with completion timestamp is claimed-no-remaining-served', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'approved',
        pendingOrders: 0,
        completedOrders: 3,
        maxOrders: 3,
        completedAt: '2026-04-11T10:30:00.000Z',
      }),
      true
    );

    expect(state.approvedTaskState).toBe('claimed-no-remaining-served');
    expect(state.showServedChip).toBe(true);
    expect(state.showOverdueChip).toBe(true);
  });
});

describe('When helper functions handle edge values', () => {
  test('Then getTaskRemainingOrders never returns negative values', () => {
    expect(
      getTaskRemainingOrders({
        completedOrders: 8,
        maxOrders: 3,
      })
    ).toBe(0);
  });

  test('Then deriveTaskLifecycleState yields neutral flags for unknown task statuses', () => {
    const state = deriveTaskLifecycleState(
      createTaskStatusItemMock({
        status: 'unknown-status',
        pendingOrders: 0,
        completedOrders: 0,
        maxOrders: 1,
      }),
      false
    );

    expect(state.normalizedStatus).toBeNull();
    expect(state.isApprovedTask).toBe(false);
    expect(state.approvedTaskState).toBeNull();
  });

  test('Then isTaskStatusItemOverdue returns false for invalid date strings and completed tasks', () => {
    expect(
      isTaskStatusItemOverdue({
        dueDate: 'not-a-date',
        completedOrders: 1,
        maxOrders: 2,
      })
    ).toBe(false);

    expect(
      isTaskStatusItemOverdue({
        dueDate: '2000-01-01',
        completedOrders: 2,
        maxOrders: 2,
      })
    ).toBe(false);
  });
});
