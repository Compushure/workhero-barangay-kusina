'use client';

import { type SetStateAction, useEffect, useMemo, useState } from 'react';
import { Calendar, ChefHat, ChevronDown, Coins, Loader2, Soup } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useRedoTask,
  useSubmitTaskVerification,
} from '@/hooks/tanstack/mutations/employeeTasksMutations';
import { formatDate } from '@/utils/date-utils';
import { isTaskStatusItemOverdue } from './task-status-utils';
import type { TaskStatusItem } from './types';

interface TaskCardDialogProps {
  task: TaskStatusItem;
  modalOpen: boolean;
  setModalOpen: (value: SetStateAction<boolean>) => void;
}

function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'Current';
    case 'in review':
      return 'In Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Task';
  }
}

function getStatusChipClassName(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'border-[#c79a54] bg-[#e7c27f] text-[#4b3522]';
    case 'in review':
      return 'border-[#87a9bc] bg-[#d7e3f4] text-[#204b61]';
    case 'approved':
      return 'border-[#7eb07f] bg-[#d8efdb] text-[#1f5a36]';
    case 'rejected':
      return 'border-[#d18d7e] bg-[#f4d6ce] text-[#8b2e22]';
    default:
      return 'border-[#d4c5a8] bg-[#efe2ca] text-[#6b5038]';
  }
}

export default function TaskCardDialog({
  task,
  modalOpen,
  setModalOpen,
}: TaskCardDialogProps) {
  const remainingOrders = Math.max(0, task.maxOrders - task.completedOrders);
  const isOverdue = isTaskStatusItemOverdue(task);
  const progressPercent =
    task.maxOrders > 0 ? Math.min(100, (task.completedOrders / task.maxOrders) * 100) : 0;

  const [remarkOpen, setRemarkOpen] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(Math.max(1, task.pendingOrders || 1));

  useEffect(() => {
    if (modalOpen) {
      setRemarkOpen(true);
      setPendingOrders(Math.max(1, Math.min(task.pendingOrders || 1, remainingOrders || 1)));
    }
  }, [modalOpen, remainingOrders, task.pendingOrders]);

  const submitMutation = useSubmitTaskVerification();
  const redoMutation = useRedoTask();

  const isApprovedTask = task.status?.toLowerCase() === 'approved';
  const isFullyCompletedAndClaimed = task.completedOrders === task.maxOrders && Boolean(task.claimedAt);
  const canSubmit =
    task.status?.toLowerCase() === 'assigned' &&
    remainingOrders > 0 &&
    !submitMutation.isSuccess;
  const canRedo = task.status?.toLowerCase() === 'rejected' && !redoMutation.isSuccess;

  const actionButtonClassName =
    'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-[#47331F] bg-[#8A6039] px-4 py-2.5 font-jersey text-[13px] tracking-[0.05em] text-[#fff6e5] shadow-[3px_3px_0px_#47331F] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#9A6E45] hover:shadow-[2px_2px_0px_#47331F] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:text-[14px]';

  const summaryChips = useMemo(
    () => [
      {
        label: 'Status',
        value: getStatusLabel(task.status),
        className: getStatusChipClassName(task.status),
      },
      {
        label: 'Orders',
        value: `${task.completedOrders}/${task.maxOrders}`,
        className: 'border-[#d4c5a8] bg-[#fff8ec] text-[#6b5038]',
      },
      {
        label: 'Pending',
        value: `${task.pendingOrders}`,
        className: 'border-[#d4c5a8] bg-[#fff8ec] text-[#6b5038]',
      },
    ],
    [task.completedOrders, task.maxOrders, task.pendingOrders, task.status]
  );

  function handleRedo() {
    if (!canRedo || redoMutation.isPending) return;

    redoMutation.mutate(task.id);
    setModalOpen(false);
  }

  function handleSubmit() {
    if (!canSubmit || submitMutation.isPending || remainingOrders <= 0) return;

    const ordersToSubmit = Math.min(pendingOrders, remainingOrders);

    submitMutation.mutate({
      kpitaskId: task.id,
      pendingOrders: ordersToSubmit,
    });
    setModalOpen(false);
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
      <DialogContent className="bottom-2 top-auto flex h-[min(100dvh-1rem,56rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] translate-y-0 flex-col overflow-hidden rounded-[1.4rem] border-3 border-[#47331F] bg-[#f7efdf] p-0 font-jersey tracking-[0.04em] shadow-[0_14px_34px_rgba(71,51,31,0.22)] sm:top-[50%] sm:bottom-auto sm:h-auto sm:max-w-2xl sm:translate-y-[-50%]">
        <DialogHeader className="flex min-w-0 flex-col gap-3 border-b-2 border-[#d4c5a8] bg-[#e1d2b7] px-4 py-3.5 text-left sm:px-5">
          <div className="space-y-2">
            <DialogTitle className="block w-full break-words pr-8 text-[20px] font-normal leading-tight text-[#3f2a1a] sm:text-[22px]">
              {task.name}
            </DialogTitle>
            <DialogDescription className="min-w-0 pr-8 text-[14px] leading-relaxed text-[#6b5038] sm:pr-10">
              {task.description}
            </DialogDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {summaryChips.map((chip) => (
              <span
                key={chip.label}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-2.5 py-1 text-[12px] leading-none ${chip.className}`}
              >
                <span className="tracking-[0.12em]">{chip.label}</span>
                <span className="text-[13px]">{chip.value}</span>
              </span>
            ))}
            {isOverdue ? (
              <span className="inline-flex items-center rounded-full border-2 border-[#d18d7e] bg-[#f4d6ce] px-2.5 py-1 text-[12px] leading-none text-[#8b2e22]">
                OVERDUE
              </span>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="space-y-4">
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

                <div className={`flex flex-col items-center ${canSubmit ? '' : 'pointer-events-none opacity-50'}`}>
                  <label className="mb-2 block text-[14px] text-[#4b3522]">Orders to Submit</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingOrders((previous) => Math.max(1, previous - 1));
                      }}
                      disabled={!canSubmit || pendingOrders === 1}
                      className="flex size-9 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[14px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, remainingOrders)}
                      value={!canSubmit ? 1 : pendingOrders}
                      onChange={(event) => {
                        const nextValue = Number.parseInt(event.target.value, 10) || 1;
                        setPendingOrders(Math.max(1, Math.min(nextValue, Math.max(1, remainingOrders))));
                      }}
                      disabled={!canSubmit}
                      tabIndex={-1}
                      className="remove-arrow w-20 rounded-md border-2 border-[#d4c5a8] bg-[#f7efdf] px-2 py-1.5 text-center text-[14px] text-[#3f2a1a] outline-none focus-visible:ring-2 focus-visible:ring-[#F4B925] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingOrders((previous) =>
                          Math.min(Math.max(1, remainingOrders), previous + 1)
                        );
                      }}
                      disabled={!canSubmit || pendingOrders === Math.max(1, remainingOrders)}
                      className="flex size-9 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[14px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <p className={`mt-1.5 text-[14px] text-[#6b5038] ${canSubmit ? '' : 'opacity-0'}`}>
                    Remaining: {remainingOrders} order{remainingOrders === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border-2 border-[#d4c5a8] bg-[#fff8ec] p-3.5 text-[#4b3522]">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[13px] tracking-[0.2em] text-[#8a6039]">DUE DATE</span>
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
                  <div className="mt-1 h-3 w-full max-w-56 overflow-hidden rounded-full border-2 border-[#9b7a56] bg-[#f1e4cf]">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#F4B925] to-[#D77A38]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {task.remark ? (
              <div className="flex min-w-0 w-full flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={() => setRemarkOpen((previous) => !previous)}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border-2 border-[#d4c5a8] bg-[#f3e4c9] px-3 py-1.5 text-[13px] text-[#4b3522] transition-all duration-200 hover:bg-[#eadbc1]"
                  aria-expanded={remarkOpen}
                >
                  <ChefHat className="size-4.5" />
                  <span className="text-[14px] leading-none">{remarkOpen ? 'Hide remark' : 'View remark'}</span>
                  <ChevronDown
                    className={`size-4.5 shrink-0 transition-transform duration-150 ${remarkOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>

                {remarkOpen ? (
                  <div className="max-h-40 w-full min-w-0 overflow-auto rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2.5">
                    <p className="break-words text-[14px] leading-relaxed text-[#4b3522]">
                      {task.remark}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {isApprovedTask && !isFullyCompletedAndClaimed ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                Claim approved task rewards from the kitchen quick task.
              </p>
            ) : isFullyCompletedAndClaimed ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                All orders are complete. Points and XP have already been claimed.
              </p>
            ) : null}

            {task.status === 'in review' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                Submitted for verification. Pending request for {task.pendingOrders} order
                {task.pendingOrders === 1 ? '' : 's'}.
              </p>
            ) : null}

            {canSubmit || canRedo ? (
              <div className="sticky bottom-0 -mx-4 border-t-2 border-[#d4c5a8] bg-[#f7efdf]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
                <div className="flex flex-col justify-end gap-2 sm:flex-row">
                  {canRedo ? (
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
                  ) : null}

                  {canSubmit ? (
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
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
