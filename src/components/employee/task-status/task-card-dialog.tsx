import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, ChefHat, ChevronDown, Coins, Loader2, Soup } from 'lucide-react';
import { TaskStatusItem } from './types';
import { SetStateAction, useState, useEffect } from 'react';
import {
  useSubmitTaskVerification,
  useClaimTaskPointsandXP,
  useRedoTask,
} from '@/hooks/tanstack/mutations/employeeTasksMutations';
import { formatDate, isTaskOverdue } from '@/utils/date-utils';

interface TaskCardDialogProps {
  task: TaskStatusItem;
  modalOpen: boolean;
  setModalOpen: (value: SetStateAction<boolean>) => void;
}

export default function TaskCardDialog({ task, modalOpen, setModalOpen }: TaskCardDialogProps) {
  const remainingOrders = task.maxOrders - task.completedOrders;

  const [remarkOpen, setRemarkOpen] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(task.pendingOrders || 1);

  // Reset remarkOpen to true whenever modal opens
  useEffect(() => {
    if (modalOpen) {
      setRemarkOpen(true);
    }
  }, [modalOpen]);

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
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md min-w-0 overflow-hidden rounded-2xl bg-linear-0 from-[#F5DDBC] to-background to-25%">
        <DialogHeader className="flex flex-col gap-1 text-left min-w-0 pt-2">
          <DialogTitle className="inline-flex w-fit max-w-full text-xl font-semibold leading-tight truncate">
            {task.name}
          </DialogTitle>
          <DialogDescription className="pr-8 min-w-0 wrap-break-word text-base text-muted-foreground">
            {task.description}
          </DialogDescription>
        </DialogHeader>

        {/* <div className="flex flex-col gap-4 text-left min-w-0 overflow-hidden"> */}
          <section className='flex py-1 border-b border-border justify-between px-6 gap-6'>
            {/* Rewards and Progress Section */}
            <div className="flex flex-col justify-baseline items-around gap-6">
              {/* Points and XP */}
              <div className="flex flex-col gap-1">
                <p className="text-center items-center flex gap-1 leading-0 justify-center">
                  <span className='text-zinc-600 font-medium text-xs'>REWARDS</span>
                  <span className='text-zinc-500 font-extralight text-xs'>( per order )</span>
                </p>
                <div className="flex items-end justify-center gap-4 text-muted-foreground">
                  <p className="flex gap-1 items-end text-lg font-medium leading-none">
                    <Coins strokeWidth={1.75} className="size-5" />
                    <span className="inline-block font-semibold pb-0.5">{task.points}</span>
                  </p>

                  <p className="flex gap-1.5 items-end font-medium pb-0.5">
                    <span className="inline-block italic text-base leading-none">XP</span>
                    <span className="inline-block font-semibold text-lg leading-none">{task.xp}</span>
                  </p>
                </div>
              </div>

              {/* Orders to Submit Section */}
              <div className={`flex flex-col items-center ${canSubmit ? '' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Orders to Submit
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingOrders((prev) => Math.max(1, prev - 1));
                    }}
                    disabled={!canSubmit || pendingOrders === 1}
                    className="bg-[#690003] text-white size-8 rounded-md flex items-center justify-center hover:bg-[#8B0000] disabled:hover:bg-[#690003] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={task.maxOrders - task.completedOrders}
                    value={!canSubmit ? 1 : pendingOrders}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 1;
                      setPendingOrders(Math.max(1, Math.min(newValue, remainingOrders)));
                    }}
                    disabled={!canSubmit}
                    tabIndex={-1}
                    className="w-20 remove-arrow rounded-md border border-gray-300 bg-card px-2 py-1 inset-shadow-xs/20 text-base text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const remainingOrders = task.maxOrders - task.completedOrders;
                      setPendingOrders((prev) => Math.min(remainingOrders, prev + 1));
                    }}
                    disabled={!canSubmit || pendingOrders === remainingOrders}
                    className="bg-[#690003] text-white size-8 rounded-md flex items-center justify-center hover:bg-[#8B0000] disabled:hover:bg-[#690003] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <p className={`text-xs text-muted-foreground mt-1 ${task.status === 'assigned' ? '' : 'opacity-0'}`}>
                  Remaining: {task.maxOrders - task.completedOrders} orders
                </p>
              </div>
            </div>


            <div className='flex flex-col items-around justify-baseline gap-6 px-4 text-muted-foreground'>  
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                  DUE DATE
                </span>
                <p className={`flex items-center gap-1.5 text-base font-medium ${isTaskOverdue(task.dueDate) ? 'text-red-700' : 'text-muted-foreground'}`}>
                  <Calendar strokeWidth={2.5} className='size-4'/>
                  {formatDate(task.dueDate)}
                </p>
              </div>

              {/* Progress */}
              <div className="flex flex-col text-base font-medium items-center gap-1">
                <span className="text-xs text-center font-medium text-zinc-600 leading-none w-full">
                  PROGRESS
                </span>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Soup strokeWidth={1.75} className="size-6" />
                  <span className="inline-block font-medium leading-0 mt-1">
                    {task.completedOrders} / {task.maxOrders} Orders
                  </span>
                </p>
                <div className="h-3 bg-primary-foreground inset-shadow-sm/15 border-2 border-muted-foreground rounded-full overflow-hidden w-36 mt-1">
                  <div
                    className="h-full bg-linear-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm/50"
                    style={{ width: `${(task.completedOrders / task.maxOrders) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>


          {/* Approved/Rejected - View Manager Remark */}
          {task.remark ? (
            <div className="flex flex-col gap-2 items-start min-w-0 w-full">
              <button
                type="button"
                onClick={() => setRemarkOpen((prev) => !prev)}
                className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-primary-foreground text-foreground text-sm font-medium shadow hover:bg-foreground hover:text-primary-foreground hover:underline hover:scale-101 transition-all ease-in-out duration-400 delay-75 px-3 py-1.5"
                aria-expanded={remarkOpen}
              >
                <ChefHat className='size-5'/>
                {remarkOpen ? 'close remark' : 'view remark'}
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform duration-150 delay-75 ease-in-out ${remarkOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {remarkOpen ? (
                <div className="overflow-auto w-full min-w-0 max-h-40 rounded-lg border border-border bg-white px-3 py-2.5 shadow-sm inset-shadow-xs/25 tramsition-all duration-500 delay-75 ease-in-out">
                  <p className="text-sm text-foreground leading-relaxed wrap-break-word break-none">
                    {task.remark}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Assigned! - Submit for verification section */}
          {canSubmit ? (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-foreground hover:bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          ) : null}

          {/* Approved! - Claim points section */}
          {canClaim ? (
            <div className="pt-2 flex flex-col items-end">
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-foreground hover:bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Claiming…
                  </>
                ) : (
                  'Claim Points & XP'
                )}
              </button>
              <p className="text-sm text-muted-foreground pt-2 text-center w-full">
                Verification request for {pendingOrders} order/s has been approved!
              </p>
            </div>
          ) : isFullyCompletedAndClaimed ? (
            <p className="text-sm text-muted-foreground pt-2 text-center flex flex-col">
              <span>All orders are complete! </span>
              <span>Points and XP have already been claimed.</span>
            </p>
          ) : null}

          {/* In Review text marker */}
          {task.status === 'in review' &&
            <p className="text-sm text-muted-foreground">
              Submitted for verification (Pending request for {pendingOrders} order/s)
            </p>
          }

          {/* Rejected! - Redo task section */}
          {canRedo &&
            <div className="pt-2">
              <div className="space-y-3">
                {/* <p className="text-sm text-amber-600">
                  This task was rejected. You can redo it and submit again for verification.
                </p> */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-foreground hover:bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {redoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Redoing…
                      </>
                    ) : (
                      'Redo Task'
                    )}
                  </button>
                </div>
              </div>
            </div>
          }
      </DialogContent>
    </Dialog>
  );
}
