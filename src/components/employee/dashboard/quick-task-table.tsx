'use client';

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useClaimTaskPointsandXP } from '@/hooks/tanstack/mutations/employeeTasksMutations';
import type { TaskStatusItem } from '@/components/employee/task-status/types';
import type { ClaimTaskResult } from '@/actions/employee/tasks';
import { useCookingStore, type CookingLaunchPayload } from '@/store/cookingStore';

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type TasksTableProps = {
  tasks?: TaskStatusItem[];
  sortOrder?: 'newest' | 'oldest';
  onPrepareFood?: (payload: CookingLaunchPayload) => void;
  claimedTaskIds: Record<string, boolean>;
  setClaimedTaskIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  retainedClaimTasks: Record<string, TaskStatusItem>;
  setRetainedClaimTasks: Dispatch<SetStateAction<Record<string, TaskStatusItem>>>;
  cookReadyByTaskId: Record<string, ClaimTaskResult['cookOutcome']>;
  setCookReadyByTaskId: Dispatch<SetStateAction<Record<string, ClaimTaskResult['cookOutcome']>>>;
};

const TASKS_PAGE_SIZE = 3;
const MIN_CLAIMING_FEEDBACK_MS = 450;

function getClaimableOrderCount(task: TaskStatusItem): number {
  if (task.pendingOrders > 0) return task.pendingOrders;
  if (!task.claimedAt && task.completedOrders > 0) return task.completedOrders;
  return 0;
}

export default function TasksTable({
  tasks: fallbackTasks = [],
  sortOrder = 'newest',
  onPrepareFood,
  claimedTaskIds,
  setClaimedTaskIds,
  retainedClaimTasks,
  setRetainedClaimTasks,
  cookReadyByTaskId,
  setCookReadyByTaskId,
}: TasksTableProps) {
  const { data, isLoading, isError } = useGetEmployeeTasks();
  const claimMutation = useClaimTaskPointsandXP();
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [preparingTaskId, setPreparingTaskId] = useState<string | null>(null);
  const [claimingTaskIds, setClaimingTaskIds] = useState<Record<string, boolean>>({});
  const [claimingTaskSnapshots, setClaimingTaskSnapshots] = useState<
    Record<string, TaskStatusItem>
  >({});
  const claimStartTimesRef = useRef<Record<string, number>>({});
  const claimFeedbackTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const activeCookingTaskId = useCookingStore((state) => state.trigger?.taskId ?? null);

  const approvedTasks = useMemo(() => {
    const source = data?.verifiedTasks ?? fallbackTasks;

    const isServerClaimablePoints = (task: TaskStatusItem) =>
      task.status === 'approved' && getClaimableOrderCount(task) > 0;

    const isServerPrepareEligible = (task: TaskStatusItem) =>
      task.status === 'approved' &&
      task.completedOrders === task.maxOrders &&
      task.pendingOrders === 0 &&
      Boolean(task.claimedAt) &&
      !task.completedAt;

    const serverTasks = source.filter(
      (task) => isServerClaimablePoints(task) || isServerPrepareEligible(task)
    );

    const merged = new Map<string, TaskStatusItem>();

    for (const task of serverTasks) {
      merged.set(task.id, task);
    }

    for (const [taskId, task] of Object.entries(retainedClaimTasks)) {
      if (cookReadyByTaskId[taskId]?.canPrepareFood) {
        merged.set(taskId, task);
      }
    }

    for (const [taskId, task] of Object.entries(claimingTaskSnapshots)) {
      if (claimingTaskIds[taskId]) {
        merged.set(taskId, task);
      }
    }

    return Array.from(merged.values());
  }, [
    data?.verifiedTasks,
    fallbackTasks,
    retainedClaimTasks,
    cookReadyByTaskId,
    claimingTaskSnapshots,
    claimingTaskIds,
  ]);

  const sortedApprovedTasks = useMemo(() => {
    return [...approvedTasks].sort((first, second) => {
      const firstTime = first.approvedAt ? new Date(first.approvedAt).getTime() : 0;
      const secondTime = second.approvedAt ? new Date(second.approvedAt).getTime() : 0;

      return sortOrder === 'newest' ? secondTime - firstTime : firstTime - secondTime;
    });
  }, [approvedTasks, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedApprovedTasks.length / TASKS_PAGE_SIZE));

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * TASKS_PAGE_SIZE;
    return sortedApprovedTasks.slice(startIndex, startIndex + TASKS_PAGE_SIZE);
  }, [sortedApprovedTasks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, data?.verifiedTasks, fallbackTasks]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(claimFeedbackTimersRef.current)) {
        clearTimeout(timer);
      }
      claimFeedbackTimersRef.current = {};
      claimStartTimesRef.current = {};
    };
  }, []);

  const finishClaimingFeedback = (taskId: string) => {
    const startedAt = claimStartTimesRef.current[taskId] ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_CLAIMING_FEEDBACK_MS - elapsed);

    const existingTimer = claimFeedbackTimersRef.current[taskId];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    claimFeedbackTimersRef.current[taskId] = setTimeout(() => {
      setClaimingTaskIds((previous) => {
        const next = { ...previous };
        delete next[taskId];
        return next;
      });

      setClaimingTaskSnapshots((previous) => {
        const next = { ...previous };
        delete next[taskId];
        return next;
      });

      delete claimStartTimesRef.current[taskId];
      delete claimFeedbackTimersRef.current[taskId];
      setActiveClaimId((previous) => (previous === taskId ? null : previous));
    }, remaining);
  };

  const handleClaim = (task: TaskStatusItem) => {
    const claimableOrderCount = getClaimableOrderCount(task);
    const hasLocalFinalClaimReady =
      Boolean(cookReadyByTaskId[task.id]?.canPrepareFood) || Boolean(retainedClaimTasks[task.id]);
    const isClaimedForCurrentBatch =
      Boolean(claimedTaskIds[task.id]) && (claimableOrderCount === 0 || hasLocalFinalClaimReady);
    if (claimMutation.isPending || isClaimedForCurrentBatch) return;

    claimStartTimesRef.current[task.id] = Date.now();
    setClaimingTaskIds((previous) => ({
      ...previous,
      [task.id]: true,
    }));
    setClaimingTaskSnapshots((previous) => ({
      ...previous,
      [task.id]: task,
    }));

    setClaimedTaskIds((previous) => ({
      ...previous,
      [task.id]: true,
    }));
    setActiveClaimId(task.id);
    claimMutation.mutate(
      {
        kpitaskId: task.id,
        taskName: task.name,
        pendingOrders: claimableOrderCount,
        completedOrders: task.completedOrders,
        maxOrders: task.maxOrders,
      },
      {
        onSuccess: (result) => {
          if (!result) {
            setClaimedTaskIds((previous) => {
              const next = { ...previous };
              delete next[task.id];
              return next;
            });
            return;
          }

          if (result?.cookOutcome?.canPrepareFood) {
            setCookReadyByTaskId((previous) => ({
              ...previous,
              [task.id]: result.cookOutcome,
            }));

            setRetainedClaimTasks((previous) => ({
              ...previous,
              [task.id]: task,
            }));
          }
        },
        onError: () => {
          setClaimedTaskIds((previous) => {
            const next = { ...previous };
            delete next[task.id];
            return next;
          });

          setRetainedClaimTasks((previous) => {
            const next = { ...previous };
            delete next[task.id];
            return next;
          });
        },
        onSettled: () => {
          finishClaimingFeedback(task.id);
        },
      }
    );
  };

  const handlePrepareFood = (task: TaskStatusItem) => {
    const cookOutcome = cookReadyByTaskId[task.id];
    const isTaskBeingClaimed = claimMutation.isPending && activeClaimId === task.id;
    const isTaskClaimingFeedbackActive = Boolean(claimingTaskIds[task.id]);
    const isServerPrepareEligible =
      task.status === 'approved' &&
      task.completedOrders === task.maxOrders &&
      task.pendingOrders === 0 &&
      Boolean(task.claimedAt) &&
      !task.completedAt;

    const isTaskCooking = activeCookingTaskId === task.id;

    if (
      (!cookOutcome?.canPrepareFood && !isServerPrepareEligible) ||
      !onPrepareFood ||
      preparingTaskId ||
      isTaskCooking ||
      isTaskBeingClaimed ||
      isTaskClaimingFeedbackActive
    ) {
      return;
    }

    setPreparingTaskId(task.id);

    onPrepareFood({
      taskId: task.id,
      taskName: task.name,
      dishName: cookOutcome?.dish?.name ?? task.cookDishName ?? task.name,
      dishImageUrl:
        cookOutcome?.dish?.imageUrl ?? task.cookDishImageUrl ?? '/assets/dish/food-sinigang.png',
      orderCount: Math.max(1, cookOutcome?.orderCount || task.cookOrderCount || task.maxOrders),
      maxOrders: cookOutcome?.maxOrders || task.maxOrders,
    });

    setCookReadyByTaskId((previous) => {
      const next = { ...previous };
      delete next[task.id];
      return next;
    });

    setRetainedClaimTasks((previous) => {
      const next = { ...previous };
      delete next[task.id];
      return next;
    });

    setClaimedTaskIds((previous) => {
      const next = { ...previous };
      delete next[task.id];
      return next;
    });

    setTimeout(() => {
      setPreparingTaskId(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="p-5 text-center font-pixel text-[14px] text-[#f5e8d6] animate-pulse">
        Loading tasks...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-5 text-center font-pixel text-[14px] text-red-300">
        Failed to load approved tasks.
      </p>
    );
  }

  return (
    <div className="space-y-2.5 rounded-xl bg-[#eadbc1] p-1 sm:p-2 max-h-[48vh] overflow-y-auto">
      {sortedApprovedTasks.length === 0 ? (
        <div className="rounded-xl border-2 border-[#d5c7ac] bg-[#f0e6d1] p-3 text-center font-pixel text-[14px] text-[#6d553d]">
          No approved tasks available.
        </div>
      ) : (
        paginatedTasks.map((task) => {
          const claimableOrderCount = getClaimableOrderCount(task);
          const totalPoints = task.points * claimableOrderCount;
          const totalXp = task.xp * claimableOrderCount;
          const isClaimingTask = Boolean(claimingTaskIds[task.id]);
          const isPreparingTask = preparingTaskId === task.id;
          const isFinalApprovedClaim = task.completedOrders >= task.maxOrders;
          const cookOutcome = cookReadyByTaskId[task.id];
          const isServerPrepareEligible =
            task.status === 'approved' &&
            task.completedOrders === task.maxOrders &&
            task.pendingOrders === 0 &&
            Boolean(task.claimedAt) &&
            !task.completedAt;
          const isTaskCooking = activeCookingTaskId === task.id;
          const hasLocalFinalClaimReady =
            Boolean(cookOutcome?.canPrepareFood) || Boolean(retainedClaimTasks[task.id]);
          const isClaimedTask =
            (Boolean(claimedTaskIds[task.id]) &&
              (claimableOrderCount === 0 || hasLocalFinalClaimReady)) ||
            isServerPrepareEligible;
          const canPrepareFood =
            (Boolean(cookOutcome?.canPrepareFood) || isServerPrepareEligible) &&
            !isPreparingTask &&
            !isClaimingTask &&
            !isTaskCooking &&
            Boolean(onPrepareFood);

          return (
            <div
              key={task.id}
              className="rounded-xl border-2 border-[#d4c5a8] bg-[#f7efdf] p-3 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-pixel text-[15px] leading-relaxed text-[#3f2a1a] wrap-break-word">
                    {task.name}
                  </div>
                  <div className="mt-0.5 font-pixel text-[14px] text-[#6b5038]">
                    Approved on {formatDate(task.approvedAt)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="kitchen-chip px-2 py-0.5 font-pixel text-[14px]">
                      {task.points} pts each
                    </span>
                    <span className="kitchen-chip px-2 py-0.5 font-pixel text-[14px]">
                      Qty {claimableOrderCount}
                    </span>
                    <span className="rounded-md border-2 border-[#7eb07f]/30 bg-[#e3f2e6] px-2 py-0.5 font-pixel text-[14px] text-[#1f5a36]">
                      Total {totalPoints} pts
                    </span>
                    <span className="rounded-md border-2 border-[#87a9bc]/35 bg-[#e0eef5] px-2 py-0.5 font-pixel text-[14px] text-[#204b61]">
                      XP {totalXp}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-md border-2 border-[#7eb07f]/45 bg-[#d8efdb] font-pixel text-[14px] text-[#1f5a36]"
                  >
                    Approved
                  </Badge>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleClaim(task)}
                      disabled={
                        claimMutation.isPending ||
                        isPreparingTask ||
                        isClaimedTask ||
                        isServerPrepareEligible ||
                        claimableOrderCount <= 0
                      }
                      className="kitchen-btn h-10 px-4 font-pixel text-[14px] hover:brightness-105"
                    >
                      {isClaimingTask
                        ? 'Claiming...'
                        : isClaimedTask || isServerPrepareEligible
                          ? 'Claimed'
                          : 'Claim'}
                    </Button>

                    {isFinalApprovedClaim ? (
                      <Button
                        size="sm"
                        onClick={() => handlePrepareFood(task)}
                        disabled={!canPrepareFood}
                        className="h-10 px-4 font-pixel text-[14px] border-2 border-[#47331F] bg-[#4d6d3a] text-[#f8edd8] shadow-[3px_3px_0px_#2e421f] hover:bg-[#5a7e45] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isPreparingTask
                          ? 'Preparing...'
                          : isTaskCooking
                            ? 'Preparing...'
                            : canPrepareFood
                              ? 'Prepare Food'
                              : 'Prepare (Claim pts first)'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {sortedApprovedTasks.length > 0 && totalPages > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
            disabled={currentPage === 1}
            className="h-10 rounded-md border border-[#9b7a56] bg-[#f7efdf] px-4 font-pixel text-[14px] text-[#4b3522] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-pixel text-[14px] text-[#6b5038]">
            {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
            disabled={currentPage === totalPages}
            className="h-10 rounded-md border border-[#9b7a56] bg-[#f7efdf] px-4 font-pixel text-[14px] text-[#4b3522] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
