'use client';

import { type SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChefHat,
  ChevronDown,
  Coins,
  Loader2,
  Soup,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  usePerformMoreOrders,
  useRedoTask,
  useSubmitTaskVerification,
} from '@/hooks/tanstack/mutations/employeeTasksMutations';
import { formatInTimeZone } from 'date-fns-tz';
import { formatDate } from '@/utils/date-utils';
import {
  deriveTaskLifecycleState,
  getTaskBaseStatusChipMeta,
  getTaskRemainingOrders,
  getTaskSignalChipMeta,
  isTaskStatusItemOverdue,
} from './task-status-utils';
import type { TaskStatusItem } from './types';

interface TaskCardDialogProps {
  task: TaskStatusItem;
  modalOpen: boolean;
  setModalOpen: (value: SetStateAction<boolean>) => void;
}

const MANILA_TIMEZONE = 'Asia/Manila';

function formatDateTimeInManila(value: string | Date | null | undefined): string {
  if (!value) return 'N/A';

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return `${formatInTimeZone(parsedDate, MANILA_TIMEZONE, 'MMM d, yyyy, h:mm a')} PHT`;
}

export default function TaskCardDialog({ task, modalOpen, setModalOpen }: TaskCardDialogProps) {
  const remainingOrders = getTaskRemainingOrders(task);
  const isOverdue = isTaskStatusItemOverdue(task);
  const lifecycle = deriveTaskLifecycleState(task, isOverdue);
  const approvedTaskState = lifecycle.approvedTaskState;
  const latestClaimedAtLabel = task.claimedAt ? formatDateTimeInManila(task.claimedAt) : null;
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
  const performMoreOrdersMutation = usePerformMoreOrders();

  // "Raw" action flags ignore overdue checks.
  // These are useful for showing disabled actions + tooltip reasons when overdue.
  const canSubmitRaw =
    lifecycle.isAssignedTask && lifecycle.hasRemainingOrders && !submitMutation.isSuccess;
  const isSubmitOverdueBlocked = canSubmitRaw && isOverdue;
  const canSubmit = canSubmitRaw && !isOverdue;

  const canRedoRaw = lifecycle.isRejectedTask && !redoMutation.isSuccess;
  const isRedoOverdueBlocked = canRedoRaw && isOverdue;
  const canRedo = canRedoRaw && !isOverdue;

  const canPerformMoreOrdersRaw =
    // User can continue only when the latest approved batch was already claimed.
    approvedTaskState === 'claimed-with-remaining' && !performMoreOrdersMutation.isSuccess;
  const isPerformOverdueBlocked = canPerformMoreOrdersRaw && isOverdue;
  const canPerformMoreOrders = canPerformMoreOrdersRaw && !isOverdue;

  const actionButtonClassName =
    'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-[#47331F] bg-[#8A6039] px-4 py-2.5 font-jersey text-[14px] tracking-[0.05em] text-[#fff6e5] shadow-[3px_3px_0px_#47331F] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#9A6E45] hover:shadow-[2px_2px_0px_#47331F] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:text-[15px]';

  const summaryChips = useMemo(() => {
    const baseStatusChip = getTaskBaseStatusChipMeta(task.status);
    const chips: Array<{ key: string; label: string; className: string; icon: LucideIcon }> = [
      {
        key: 'status',
        label: baseStatusChip.label,
        className: baseStatusChip.className,
        icon: baseStatusChip.icon,
      },
    ];

    if (lifecycle.isInReviewTask) {
      chips.push({
        key: 'pending',
        label: `Pending ${task.pendingOrders}`,
        className: 'border-[#d4c5a8] bg-[#fff8ec] text-[#6b5038]',
        icon: ChefHat,
      });
    }

    if (lifecycle.showOverdueChip && (lifecycle.isAssignedTask || lifecycle.isRejectedTask)) {
      const overdueChip = getTaskSignalChipMeta('overdue');
      chips.push({
        key: 'overdue',
        label: overdueChip.label,
        className: overdueChip.className,
        icon: overdueChip.icon,
      });
    }

    if (lifecycle.showClaimedChip) {
      const claimedChip = getTaskSignalChipMeta('claimed');
      chips.push({
        key: 'claimed',
        label: claimedChip.label,
        className: claimedChip.className,
        icon: claimedChip.icon,
      });
    }

    if (lifecycle.showServedChip) {
      const servedChip = getTaskSignalChipMeta('served');
      chips.push({
        key: 'served',
        label: servedChip.label,
        className: servedChip.className,
        icon: servedChip.icon,
      });
    }

    return chips;
  }, [
    lifecycle.isInReviewTask,
    lifecycle.isAssignedTask,
    lifecycle.isRejectedTask,
    lifecycle.showClaimedChip,
    lifecycle.showOverdueChip,
    lifecycle.showServedChip,
    task.pendingOrders,
    task.status,
  ]);

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

  function handlePerformMoreOrders() {
    if (!canPerformMoreOrders || performMoreOrdersMutation.isPending) return;

    performMoreOrdersMutation.mutate(task.id, {
      onSuccess: () => {
        setModalOpen(false);
      },
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
      <DialogContent className="top-[50%] bottom-auto flex h-auto max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] translate-y-[-50%] flex-col overflow-hidden rounded-[1.15rem] border-3 border-[#47331F] bg-[#f7efdf] p-0 font-jersey tracking-[0.04em] shadow-[0_14px_34px_rgba(71,51,31,0.22)] sm:max-h-[85dvh] sm:max-w-2xl sm:rounded-[1.4rem]">
        <DialogHeader className="flex min-w-0 flex-col gap-2.5 border-b-2 border-[#d4c5a8] bg-[#e1d2b7] px-3 py-3 text-left sm:gap-3 sm:px-5 sm:py-3.5">
          <div className="space-y-1 sm:space-y-2">
            <DialogTitle className="block w-full wrap-break-word pr-8 text-[1.35rem] font-normal leading-7 text-[#3f2a1a] sm:text-[1.5rem]">
              {task.name}
            </DialogTitle>
            <DialogDescription className="min-w-0 pr-8 text-[0.9rem] leading-5 text-[#6b5038] sm:pr-10 sm:text-[1rem]">
              {task.description}
            </DialogDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {summaryChips.map((chip) => {
              const ChipIcon = chip.icon;

              return (
                <span
                  key={chip.key}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[12px] leading-none sm:text-[13px] ${chip.className}`}
                >
                  <ChipIcon className="size-3.5 shrink-0" />
                  <span className="inline-flex items-center leading-none tracking-[0.08em]">
                    {chip.label}
                  </span>
                </span>
              );
            })}
          </div>
        </DialogHeader>

        <div className="overflow-x-hidden overflow-y-auto px-3 py-2.5 sm:px-5 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <section className="grid grid-cols-2 gap-2 border-b-2 border-[#d4c5a8] pb-2.5 sm:gap-4 sm:pb-4">
              <div className="min-w-0 space-y-2 rounded-xl border-2 border-[#d4c5a8] bg-[#fff8ec] p-2.5 sm:space-y-4 sm:p-3.5">
                <div className="flex flex-col gap-1.5">
                  <p className="flex items-center justify-center gap-1.5 text-center">
                    <span className="text-[11px] tracking-[0.16em] text-[#8a6039] sm:text-[13px] sm:tracking-[0.2em]">
                      REWARDS
                    </span>
                    <span className="text-[11px] text-[#9c8667]">(PER ORDER)</span>
                  </p>
                  <div className="flex items-end justify-center gap-2 text-[#4b3522] sm:gap-4">
                    <p className="flex items-end gap-1 text-[14px] leading-none sm:gap-1.5 sm:text-[17px]">
                      <Coins strokeWidth={1.75} className="size-4 shrink-0 sm:size-5" />
                      <span className="inline-block pb-0.5 text-[15px] sm:text-[18px]">
                        {task.points}
                      </span>
                    </p>

                    <p className="flex items-end gap-1 pb-0.5 sm:gap-1.5">
                      <span className="inline-block text-[12px] leading-none sm:text-[15px]">
                        XP
                      </span>
                      <span className="inline-block text-[15px] leading-none sm:text-[18px]">
                        {task.xp}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center ${canSubmit ? '' : 'pointer-events-none opacity-50'}`}
                >
                  <label className="mb-1 block text-[12px] text-[#4b3522] sm:mb-2 sm:text-[15px]">
                    Orders to Submit
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingOrders((previous) => Math.max(1, previous - 1));
                      }}
                      disabled={!canSubmit || pendingOrders === 1}
                      className="flex size-8 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[13px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50 sm:size-9 sm:text-[15px]"
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
                        setPendingOrders(
                          Math.max(1, Math.min(nextValue, Math.max(1, remainingOrders)))
                        );
                      }}
                      disabled={!canSubmit}
                      tabIndex={-1}
                      className="remove-arrow w-14 rounded-md border-2 border-[#d4c5a8] bg-[#f7efdf] px-1.5 py-1.5 text-center text-[13px] text-[#3f2a1a] outline-none focus-visible:ring-2 focus-visible:ring-[#F4B925] disabled:cursor-not-allowed disabled:opacity-50 sm:w-20 sm:px-2 sm:text-[15px]"
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
                      className="flex size-8 items-center justify-center rounded-md border-2 border-[#47331F] bg-[#8A6039] text-[13px] text-[#fff6e5] transition-colors hover:bg-[#9A6E45] disabled:cursor-not-allowed disabled:opacity-50 sm:size-9 sm:text-[15px]"
                    >
                      +
                    </button>
                  </div>

                  <p
                    className={`mt-1 text-[11px] text-[#6b5038] sm:mt-1.5 sm:text-[15px] ${canSubmit ? '' : 'opacity-0'}`}
                  >
                    Remaining: {remainingOrders} order{remainingOrders === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex flex-col gap-2 rounded-xl border-2 border-[#d4c5a8] bg-[#fff8ec] p-2.5 text-[#4b3522] sm:gap-4 sm:p-3.5">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[13px] tracking-[0.2em] text-[#8a6039] sm:text-[14px]">
                    DUE DATE
                  </span>
                  <p
                    className={`flex items-center gap-1 text-[12px] sm:gap-2 sm:text-[17px] ${(lifecycle.showOverdueChip && (lifecycle.isAssignedTask || lifecycle.isRejectedTask)) ? 'text-[#8b2e22]' : 'text-[#4b3522]'}`}
                  >
                    <Calendar strokeWidth={2.5} className="size-3.5 sm:size-5" />
                    {formatDate(task.dueDate)}
                  </p>
                </div>

                <div className="px-4 flex flex-col items-center gap-1 text-[16px] sm:gap-1.5 sm:text-[17px]">
                  <span className="w-full text-center text-[13px] leading-none text-[#8a6039] sm:text-[14px]">
                    PROGRESS
                  </span>
                  <p className="flex items-center gap-1 text-[#4b3522] sm:gap-2">
                    <Soup strokeWidth={1.75} className="size-4.5 sm:size-6" />
                    <span className="mt-1 inline-block text-[13px] leading-none sm:text-[18px]">
                      {task.completedOrders} / {task.maxOrders} Orders
                    </span>
                  </p>
                  <div className="mt-1 h-2.5 w-full max-w-56 overflow-hidden rounded-full border-2 border-[#9b7a56] bg-[#f1e4cf] sm:h-3">
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
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border-2 border-[#d4c5a8] bg-[#f3e4c9] px-3 py-1.5 text-[14px] text-[#4b3522] transition-all duration-200 hover:bg-[#eadbc1]"
                  aria-expanded={remarkOpen}
                >
                  <ChefHat className="size-4.5" />
                  <span className="text-[15px] leading-none">
                    {remarkOpen ? 'Hide remark' : 'View remark'}
                  </span>
                  <ChevronDown
                    className={`size-4.5 shrink-0 transition-transform duration-150 ${remarkOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>

                {remarkOpen ? (
                  <div className="max-h-40 w-full min-w-0 overflow-auto rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2.5">
                    <p className="wrap-break-word text-[15px] leading-relaxed text-[#4b3522]">
                      {task.remark}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {approvedTaskState === 'unclaimed-with-remaining' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                This approved task still has unclaimed rewards. Claim points and XP from the kitchen
                quick task. You can still perform more orders after
              </p>
            ) : approvedTaskState === 'claimed-with-remaining' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                Rewards are already claimed. Use Perform More Orders to continue this task.
              </p>
            ) : approvedTaskState === 'unclaimed-no-remaining' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                All orders are completed, but rewards are not yet claimed. Claim points and XP from
                the kitchen quick task.
              </p>
            ) : approvedTaskState === 'claimed-no-remaining-served' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                All orders are complete and dishes have been served. Points and XP are already
                claimed.
              </p>
            ) : approvedTaskState === 'claimed-no-remaining-unserved' ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                All orders are complete. Points and XP are already claimed. Proceed to kitchen to
                serve dishes
              </p>
            ) : null}

            {lifecycle.isInReviewTask ? (
              <p className="rounded-lg border-2 border-[#d4c5a8] bg-[#fff8ec] px-3 py-2 text-center text-[14px] text-[#6b5038]">
                Submitted for verification. Pending request for {task.pendingOrders} order
                {task.pendingOrders === 1 ? '' : 's'}.
              </p>
            ) : null}

            {canSubmitRaw || canRedoRaw || canPerformMoreOrdersRaw ? (
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

                  {isRedoOverdueBlocked ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-flex w-full sm:w-auto">
                          <button type="button" disabled className={actionButtonClassName}>
                            Redo Task
                          </button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs border-[#9b7a56] bg-[#FFF2CC] text-center font-jersey text-[14px] leading-snug tracking-[0.04em] text-[#3B2A1A]">
                        unable to redo overdue tasks
                      </TooltipContent>
                    </Tooltip>
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

                  {isSubmitOverdueBlocked ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-flex w-full sm:w-auto">
                          <button type="button" disabled className={actionButtonClassName}>
                            Submit for Verification
                          </button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs border-[#9b7a56] bg-[#FFF2CC] text-center font-jersey text-[14px] leading-snug tracking-[0.04em] text-[#3B2A1A]">
                        unable to submit overdue tasks
                      </TooltipContent>
                    </Tooltip>
                  ) : null}

                  {canPerformMoreOrders ? (
                    <button
                      type="button"
                      onClick={handlePerformMoreOrders}
                      disabled={performMoreOrdersMutation.isPending}
                      className={actionButtonClassName}
                    >
                      {performMoreOrdersMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                          Continuing...
                        </>
                      ) : (
                        'Perform More Orders'
                      )}
                    </button>
                  ) : null}

                  {isPerformOverdueBlocked ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-flex w-full sm:w-auto">
                          <button type="button" disabled className={actionButtonClassName}>
                            Perform More Orders
                          </button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs border-[#9b7a56] bg-[#FFF2CC] text-center font-jersey text-[14px] leading-snug tracking-[0.04em] text-[#3B2A1A]">
                        unable to submit remaining orders for overdue tasks
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            ) : null}

            {latestClaimedAtLabel ? (
              <p className="pt-1 text-center text-[0.75rem] leading-none tracking-[0.04em] text-[#8a6039] sm:text-[0.9rem]">
                FIESTA POINTS from latest request claimed at: {latestClaimedAtLabel}
              </p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
