/**
 * Test coverage:
 * - Employee task-board data conversion and cloning
 * - Optimistic transformations (verify, redo, claim, perform-more)
 * - Board equivalence checks and no-op edge branches
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/task-status-data.test.ts
 */

import { describe, expect, test } from '@jest/globals';

import {
  applyOptimisticPerformMoreOrders,
  applyOptimisticTaskClaim,
  applyOptimisticTaskRedo,
  applyOptimisticTaskVerification,
  areEmployeeTaskBoardsEquivalent,
  cloneEmployeeTaskBoardData,
  emptyEmployeeTaskBoardData,
  toEmployeeTaskBoardData,
  toEmployeeTasksQueryData,
  type EmployeeTaskBoardData,
} from '@/components/employee/task-status/task-status-data';
import { employeeTaskStatusMockData } from '../../mockData/employeeTaskMockData';

function createBoardData(): EmployeeTaskBoardData {
  return {
    currentTasks: [employeeTaskStatusMockData.assigned],
    inReviewTasks: [employeeTaskStatusMockData.inReview],
    verifiedTasks: [employeeTaskStatusMockData.approvedClaimable],
    rejectedTasks: [employeeTaskStatusMockData.rejected],
  };
}

describe('When converting and cloning employee task-board data', () => {
  test('Then toEmployeeTaskBoardData maps query buckets to board buckets', () => {
    const board = toEmployeeTaskBoardData({
      currentTasks: [employeeTaskStatusMockData.assigned],
      onReviewTasks: [employeeTaskStatusMockData.inReview],
      verifiedTasks: [employeeTaskStatusMockData.approvedClaimable],
      deniedTasks: [employeeTaskStatusMockData.rejected],
    });

    expect(board.currentTasks[0]?.id).toBe(employeeTaskStatusMockData.assigned.id);
    expect(board.inReviewTasks[0]?.id).toBe(employeeTaskStatusMockData.inReview.id);
    expect(board.verifiedTasks[0]?.id).toBe(employeeTaskStatusMockData.approvedClaimable.id);
    expect(board.rejectedTasks[0]?.id).toBe(employeeTaskStatusMockData.rejected.id);
  });

  test('Then toEmployeeTaskBoardData returns a safe empty clone for missing query data', () => {
    const board = toEmployeeTaskBoardData(null);

    expect(board).toEqual(emptyEmployeeTaskBoardData);
    expect(board).not.toBe(emptyEmployeeTaskBoardData);
  });

  test('Then cloneEmployeeTaskBoardData creates deep-cloned task arrays', () => {
    const original = createBoardData();
    const clone = cloneEmployeeTaskBoardData(original);

    clone.currentTasks[0]!.name = 'Mutated Name';

    expect(original.currentTasks[0]!.name).not.toBe('Mutated Name');
    expect(clone.currentTasks).not.toBe(original.currentTasks);
  });
});

describe('When optimistic updates run for task workflow transitions', () => {
  test('Then applyOptimisticTaskVerification moves a task from current to in-review and sets pending orders', () => {
    const original = createBoardData();

    const next = applyOptimisticTaskVerification(original, {
      taskId: employeeTaskStatusMockData.assigned.id,
      pendingOrders: 2,
    });

    expect(next.currentTasks.some((task) => task.id === employeeTaskStatusMockData.assigned.id)).toBe(false);
    expect(next.inReviewTasks[0]).toEqual(
      expect.objectContaining({
        id: employeeTaskStatusMockData.assigned.id,
        status: 'in review',
        pendingOrders: 2,
      })
    );
  });

  test('Then applyOptimisticTaskVerification returns the same object when task ID is missing', () => {
    const original = createBoardData();

    const next = applyOptimisticTaskVerification(original, {
      taskId: 'missing-task-id',
      pendingOrders: 1,
    });

    expect(next).toBe(original);
  });

  test('Then applyOptimisticTaskRedo moves rejected task back to current with pending orders reset', () => {
    const original = createBoardData();

    const next = applyOptimisticTaskRedo(original, employeeTaskStatusMockData.rejected.id);

    expect(next.rejectedTasks.some((task) => task.id === employeeTaskStatusMockData.rejected.id)).toBe(false);
    expect(next.currentTasks[0]).toEqual(
      expect.objectContaining({
        id: employeeTaskStatusMockData.rejected.id,
        status: 'assigned',
        pendingOrders: 0,
      })
    );
  });

  test('Then applyOptimisticTaskClaim updates verified task as claimed and clears pending orders', () => {
    const original = createBoardData();

    const next = applyOptimisticTaskClaim(original, employeeTaskStatusMockData.approvedClaimable.id);

    expect(next.verifiedTasks[0]).toEqual(
      expect.objectContaining({
        id: employeeTaskStatusMockData.approvedClaimable.id,
        status: 'approved',
        pendingOrders: 0,
      })
    );
    expect(next.verifiedTasks[0]?.claimedAt).toEqual(expect.any(String));
  });

  test('Then applyOptimisticPerformMoreOrders moves verified task to current with assigned status', () => {
    const original = createBoardData();

    const next = applyOptimisticPerformMoreOrders(
      original,
      employeeTaskStatusMockData.approvedClaimable.id
    );

    expect(next.verifiedTasks.some((task) => task.id === employeeTaskStatusMockData.approvedClaimable.id)).toBe(
      false
    );
    expect(next.currentTasks[0]).toEqual(
      expect.objectContaining({
        id: employeeTaskStatusMockData.approvedClaimable.id,
        status: 'assigned',
        pendingOrders: 0,
      })
    );
  });
});

describe('When checking task-board equivalence', () => {
  test('Then areEmployeeTaskBoardsEquivalent returns true for semantically equal boards', () => {
    const left = createBoardData();
    const right = cloneEmployeeTaskBoardData(left);

    expect(areEmployeeTaskBoardsEquivalent(left, right)).toBe(true);
    expect(toEmployeeTasksQueryData(left)).toEqual(toEmployeeTasksQueryData(right));
  });

  test('Then areEmployeeTaskBoardsEquivalent returns false when a key task field changes', () => {
    const left = createBoardData();
    const right = cloneEmployeeTaskBoardData(left);

    right.verifiedTasks[0] = {
      ...right.verifiedTasks[0],
      pendingOrders: (right.verifiedTasks[0]?.pendingOrders ?? 0) + 1,
    };

    expect(areEmployeeTaskBoardsEquivalent(left, right)).toBe(false);
  });
});
