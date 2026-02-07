'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { claimTaskPointsAndXP } from '@/actions/employee/tasks';
import type { TaskStatusItem } from './types';

interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const canClaim = task.status?.toLowerCase() === 'approved' && !task.claimedAt && !claimSuccess;

  async function handleClaim() {
    if (!canClaim || claimLoading) return;
    setClaimLoading(true);
    const { error, data } = await claimTaskPointsAndXP(task.id);
    setClaimLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Claimed ${data?.pointsAdded ?? 0} points and ${data?.xpAdded ?? 0} XP`);
    setClaimSuccess(true);
    router.refresh();
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        className="rounded-xl shadow-sm border py-3 px-4 sm:py-4 sm:px-5 w-full min-w-0 cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <CardContent className="p-0 flex flex-col gap-3 sm:gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-5">
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <span className="inline-flex w-fit rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs sm:text-sm font-semibold leading-tight">
                {task.taskType}
              </span>
              <p className="text-sm sm:text-base font-semibold leading-snug wrap-break-word">
                {task.title}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end shrink-0 text-left sm:text-right gap-1.5 w-full sm:w-auto sm:min-w-[120px] border-t pt-3 sm:border-0 sm:pt-0">
              <div className="flex items-center justify-between sm:justify-end w-full gap-3">
                <span className="text-sm font-normal text-muted-foreground tabular-nums">
                  {task.progressCurrent}/{task.progressMax}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-2 text-sm sm:text-base font-bold tabular-nums">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden />
                    {task.points}
                  </span>
                  <span className="text-sm sm:text-base font-normal">
                    XP <span className="font-bold tabular-nums">{task.xp}</span>
                  </span>
                </div>
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                DUE : {task.dueDate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setRemarkOpen(false);
            setClaimSuccess(false);
          }
        }}
      >
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md min-w-0 overflow-hidden">
          <DialogHeader className="flex flex-col gap-2 text-left min-w-0">
            <span className="inline-flex w-fit max-w-full rounded-full bg-[#FBEEDC] text-[#8B2F0C] px-3 py-1 text-sm font-semibold leading-tight truncate">
              {task.taskType}
            </span>
            <DialogTitle className="pr-8 min-w-0 wrap-break-word">{task.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-left min-w-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Progress
                </span>
                <p className="text-sm font-medium mt-1 tabular-nums">
                  {task.progressCurrent} / {task.progressMax}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Due date
                </span>
                <p className="text-sm font-medium mt-1">{task.dueDate}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Points
                </span>
                <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {task.points}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  XP
                </span>
                <p className="text-sm font-bold mt-1 tabular-nums">{task.xp}</p>
              </div>
            </div>
            {task.remark ? (
              <div className="flex flex-col gap-2 items-end min-w-0 w-full">
                <button
                  type="button"
                  onClick={() => setRemarkOpen((prev) => !prev)}
                  className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-[#8B0000] text-white text-sm font-medium underline shadow-sm hover:bg-[#6B0000] transition-colors px-3 py-1.5"
                  aria-expanded={remarkOpen}
                >
                  view remark
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${remarkOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {remarkOpen ? (
                  <div className="w-full min-w-0 rounded-lg border border-border bg-white px-3 py-2.5 shadow-sm overflow-hidden">
                    <p className="text-sm text-foreground leading-relaxed wrap-break-word break-all">
                      {task.remark}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {canClaim ? (
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claimLoading}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {claimLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Claiming…
                    </>
                  ) : (
                    'Claim Points & XP'
                  )}
                </button>
              </div>
            ) : null}
            {(claimSuccess || (task.status?.toLowerCase() === 'approved' && task.claimedAt)) &&
            !canClaim ? (
              <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                Points and XP have already been claimed.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
