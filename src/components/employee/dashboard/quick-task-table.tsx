'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useClaimTaskPointsandXP } from '@/hooks/tanstack/mutations/employeeTasksMutations';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

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
};

const TASKS_PAGE_SIZE = 3;

export default function TasksTable({
  tasks: fallbackTasks = [],
  sortOrder = 'newest',
}: TasksTableProps) {
  const { data, isLoading, isError } = useGetEmployeeTasks();
  const claimMutation = useClaimTaskPointsandXP();
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const approvedTasks = useMemo(() => {
    const source = data?.verifiedTasks ?? fallbackTasks;
    return source.filter((task) => task.status === 'approved' && task.pendingOrders > 0);
  }, [data?.verifiedTasks, fallbackTasks]);

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

  const handleClaim = (task: TaskStatusItem) => {
    if (claimMutation.isPending) return;

    setActiveClaimId(task.id);
    claimMutation.mutate(
      {
        kpitaskId: task.id,
        taskName: task.name,
        pendingOrders: task.pendingOrders,
        completedOrders: task.completedOrders,
        maxOrders: task.maxOrders,
      },
      {
        onSettled: () => {
          setActiveClaimId(null);
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-5 text-center font-pixel text-[14px] text-[#f5e8d6] animate-pulse">Loading tasks...</div>;
  }

  if (isError) {
    return <p className="p-5 text-center font-pixel text-[14px] text-red-300">Failed to load approved tasks.</p>;
  }

  return (
    <div className="space-y-2.5 rounded-xl bg-[#eadbc1] p-1 sm:p-2 max-h-[48vh] overflow-y-auto">
      {sortedApprovedTasks.length === 0 ? (
        <div className="rounded-xl border-2 border-[#d5c7ac] bg-[#f0e6d1] p-3 text-center font-pixel text-[14px] text-[#6d553d]">
          No approved tasks available.
        </div>
      ) : (
        paginatedTasks.map((task) => {
          const totalPoints = task.points * task.pendingOrders;
          const totalXp = task.xp * task.pendingOrders;
          const isClaimingTask = claimMutation.isPending && activeClaimId === task.id;

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
                      Qty {task.pendingOrders}
                    </span>
                    <span className="rounded-md border-2 border-[#7eb07f]/30 bg-[#e3f2e6] px-2 py-0.5 font-pixel text-[14px] text-[#1f5a36]">
                      Total {totalPoints} pts
                    </span>
                    <span className="rounded-md border-2 border-[#87a9bc]/35 bg-[#e0eef5] px-2 py-0.5 font-pixel text-[14px] text-[#204b61]">
                      XP {totalXp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-md border-2 border-[#7eb07f]/45 bg-[#d8efdb] font-pixel text-[14px] text-[#1f5a36]"
                  >
                    Approved
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleClaim(task)}
                    disabled={claimMutation.isPending}
                    className="kitchen-btn h-10 px-4 font-pixel text-[14px] hover:brightness-105"
                  >
                    {isClaimingTask ? 'Claiming...' : 'Claim'}
                  </Button>
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
