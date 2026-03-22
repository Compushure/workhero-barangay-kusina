'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, ChefHat, ChevronDown, Coins, Loader2, Soup } from 'lucide-react';
import { type SetStateAction, useEffect, useState } from 'react';
import type { TaskStatusItem } from './types';
import {
  useSubmitTaskVerification,
  useClaimTaskPointsandXP,
  useRedoTask,
} from '@/hooks/tanstack/mutations/employeeTasksMutations';
import { formatDate } from '@/utils/date-utils';
import { isTaskStatusItemOverdue } from './task-status-utils';

interface TaskCardDialogProps {
  task: TaskStatusItem;
  modalOpen: boolean;
  setModalOpen: (value: SetStateAction<boolean>) => void;
}

export default function TaskCardDialog({ task, modalOpen, setModalOpen }: TaskCardDialogProps) {
  const remainingOrders = task.maxOrders - task.completedOrders;
  const isOverdue = isTaskStatusItemOverdue(task);

  const [remarkOpen, setRemarkOpen] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(task.pendingOrders || 1);

  useEffect(() => {
    if (modalOpen) {
      setRemarkOpen(true);
      setPendingOrders(task.pendingOrders || 1);
    }
  }, [modalOpen, task.pendingOrders]);

  const submitMutation = useSubmitTaskVerification();
  const claimMutation = useClaimTaskPointsandXP();
  const redoMutation = useRedoTask();

  const canClaim =
    task.status?.toLowerCase() === 'approved' &&
    task.pendingOrders !== 0 &&
    !claimMutation.isSuccess;
  const isFullyCompletedAndClaimed = task.completedOrders === task.maxOrders && task.claimedAt;
  const canSubmit = task.status?.toLowerCase() === 'assigned' && !submitMutation.isSuccess;
  const canRedo = task.status?.toLowerCase() === 'rejected' && !redoMutation.isSuccess;

  const actionButtonClassName =
    'inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#47331F] bg-[#8A6039] px-4 py-2 font-jersey text-[13px] tracking-[0.05em] text-[#fff6e5] shadow-[3px_3px_0px_#47331F] transition-all duration-150 hover:bg-[#9A6E45] disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:text-[14px]';

  function handleRedo() {
    if (!canRedo || redoMutation.isPending) return;
    redoMutation.mutate(task.id);
  }

  function handleClaim() {
    if (!canClaim || claimMutation.isPending) return;
    claimMutation.mutate({
      kpitaskId: task.id,
      taskName: task.name,
      pendingOrders: task.pendingOrders,
      completedOrders: task.completedOrders,
      maxOrders: task.maxOrders,
    });
  }

  function handleSubmit() {
    if (!canSubmit || submitMutation.isPending) return;
    const ordersToSubmit = Math.min(pendingOrders, remainingOrders);
    submitMutation.mutate({
      kpitaskId: task.id,
      pendingOrders: ordersToSubmit,
    });
  }

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) {
          setRemarkOpen(false);
        }
      }}
    >
      <DialogContent className="w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border-3 border-[#47331F] bg-[#f7efdf] p-0 font-jersey tracking-[0.04em] shadow-[0_14px_34px_rgba(71,51,31,0.22)] sm:max-w-xl">
        <DialogHeader className="flex min-w-0 flex-col gap-2 border-b-2 border-[#d4c5a8] bg-[#e1d2b7] px-4 py-3.5 text-left">
          <DialogTitle className="block w-full text-[20px] font-normal leading-tight text-[#3f2a1a] break-words">
            {task.name}
          </DialogTitle>
          <DialogDescription className="min-w-0 pr-8 text-[14px] leading-relaxed text-[#6b5038]">
            {task.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <section className="grid gap-4 border-b-2 border-[#d4c5a8] pb-4 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border-2 border-[#d4c5a8] bg-[#fff8ec] p-3.5">
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center justify-center gap-1.5 text-center">
                  <span className="text-[13px] tracking-[0.2em] text-[#8a6039]">REWARDS</span>
                  <span className="text-[11px] text-[#9c8667]">(PER ORDER)</span>
                </p>
                <div className="flex items-end justify-center gap-4 text-[#4b3522]">
                  <p className="flex items-end gap-1.5 text-[17px] leading-none">
                    <Coins strokeWidth={1.75} className="size-5 shrink-0" />
                    <span className="inline-block pb-0.5 text-[18px]">{task.points}</span>
                  </p>

                  <p className="flex items-end gap-1.5 pb-0.5">
                    <span className="inline-block text-[15px] leading-none">XP</span>
                    <span className="inline-block text-[18px] leading-none">{task.xp}</span>
                  </p>
                </div>
              </div>

              <div className={`flex flex-col items-center ${canSubmit ? '' : 'opacity-50 pointer-events-none'}`}>
                <label className="mb-2 block text-[14px] text-[#4b3522]">
                  Orders to Submit
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingOrders((prev) => Math.max(1, prev - 1));
                    }}
                    disabled={!canSubmit || pendingOrders === 1}
                    className="flex size-8 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[14px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={task.maxOrders - task.completedOrders}
                    value={!canSubmit ? 1 : pendingOrders}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10) || 1;
                      setPendingOrders(Math.max(1, Math.min(newValue, remainingOrders)));
                    }}
                    disabled={!canSubmit}
                    tabIndex={-1}
                    className="remove-arrow w-18 rounded-md border-2 border-[#d4c5a8] bg-[#f7efdf] px-2 py-1.5 text-center text-[14px] text-[#3f2a1a] outline-none focus-visible:ring-2 focus-visible:ring-[#F4B925] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingOrders((prev) => Math.min(remainingOrders, prev + 1));
                    }}
                    disabled={!canSubmit || pendingOrders === remainingOrders}
                    className="flex size-8 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[14px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <p className={`mt-1.5 text-[12px] text-[#6b5038] ${task.status === 'assigned' ? '' : 'opacity-0'}`}>
                  Remaining: {task.maxOrders - task.completedOrders} orders
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-baseline gap-4 rounded-xl border-2 border-[#d4c5a8] bg-[#fff8ec] p-3.5 text-[#4b3522]">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[13px] tracking-[0.2em] text-[#8a6039]">
                  DUE DATE
                </span>
                <p className={`flex items-center gap-2 text-[16px] ${isOverdue ? 'text-[#8b2e22]' : 'text-[#4b3522]'}`}>
                  <Calendar strokeWidth={2.5} className="size-5" />
                  {formatDate(task.dueDate)}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-[16px]">
                <span className="w-full text-center text-[13px] leading-none text-[#8a6039]">
                  PROGRESS
                </span>
                <p className="flex items-center gap-2 text-[#4b3522]">
                  <Soup strokeWidth={1.75} className="size-6" />
                  <span className="mt-1 inline-block text-[17px] leading-none">
                    {task.completedOrders} / {task.maxOrders} Orders
                  </span>
                </p>
                <div className="mt-1 h-3 w-36 overflow-hidden rounded-full border-2 border-[#9b7a56] bg-[#f1e4cf]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#F4B925] to-[#D77A38]"
                    style={{ width: `${(task.completedOrders / task.maxOrders) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {task.remark ? (
            <div className="flex min-w-0 w-full flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => setRemarkOpen((prev) => !prev)}
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border-2 border-[#d4c5a8] bg-[#f3e4c9] px-3 py-1.5 text-[13px] text-[#4b3522] transition-all duration-200 hover:bg-[#eadbc1]"
                aria-expanded={remarkOpen}
              >
                <ChefHat className="size-4.5" />
                {remarkOpen ? 'close remark' : 'view remark'}
                <ChevronDown
                  className={`size-4.5 shrink-0 transition-transform duration-150 ${remarkOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {remarkOpen ? (
                <div className="max-h-32 w-full min-w-0 overflow-auto rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2.5">
                  <p className="wrap-break-word text-[13px] leading-relaxed text-[#4b3522]">
                    {task.remark}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {canSubmit ? (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className={actionButtonClassName}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          ) : null}

          {canClaim ? (
            <div className="flex flex-col items-end pt-2">
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className={actionButtonClassName}
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Claiming...
                  </>
                ) : (
                  'Claim Points & XP'
                )}
              </button>
              <p className="w-full pt-2 text-center text-[14px] text-[#6b5038]">
                Verification request for {pendingOrders} order/s has been approved!
              </p>
            </div>
          ) : isFullyCompletedAndClaimed ? (
            <p className="flex flex-col pt-2 text-center text-[14px] text-[#6b5038]">
              <span>All orders are complete!</span>
              <span>Points and XP have already been claimed.</span>
            </p>
          ) : null}

          {task.status === 'in review' ? (
            <p className="text-center text-[14px] text-[#6b5038]">
              Submitted for verification (Pending request for {pendingOrders} order/s)
            </p>
          ) : null}

          {canRedo ? (
            <div className="pt-2">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoMutation.isPending}
                    className={actionButtonClassName}
                  >
                    {redoMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Redoing...
                      </>
                    ) : (
                      'Redo Task'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
