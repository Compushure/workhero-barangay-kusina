import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Coins, Loader2 } from "lucide-react";
import { TaskStatusItem } from "./types";
import { SetStateAction, useState } from "react";
import { useSubmitTaskVerification, useClaimTaskPoints, useRedoTask } from "@/hooks/tanstack/mutations/employeeTasksMutations";

interface TaskCardDialogProps {
  task: TaskStatusItem;
  modalOpen: boolean;
  setModalOpen: (value: SetStateAction<boolean>) => void
}

export default function TaskCardDialog({task, modalOpen, setModalOpen} : TaskCardDialogProps) {
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(1);
  
  const submitMutation = useSubmitTaskVerification();
  const claimMutation = useClaimTaskPoints();
  const redoMutation = useRedoTask();
  
  const canClaim = task.status?.toLowerCase() === 'approved' && task.completedOrders > task.claimedOrders && !claimMutation.isSuccess;
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
      completedOrders: task.completedOrders,
      maxOrders: task.maxOrders
    });
  }

  function handleSubmit() {
    if (!canSubmit || submitMutation.isPending) return;
    const remainingOrders = task.maxOrders - task.completedOrders;
    const ordersToSubmit = Math.min(pendingOrders, remainingOrders);
    submitMutation.mutate({ 
      kpitaskId: task.id, 
      pendingOrders: ordersToSubmit 
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
        <DialogHeader className="flex flex-col gap-1 text-left min-w-0">
          <DialogTitle className="inline-flex w-fit max-w-full text-xl font-semibold leading-tight truncate">
            {task.name}
          </DialogTitle>
          <DialogDescription className="pr-8 min-w-0 wrap-break-word text-base text-muted-foreground">{task.description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 text-left min-w-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 min-w-0">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Progress
              </span>
              <p className="text-sm font-medium mt-1 tabular-nums">
                {task.completedOrders} / {task.maxOrders}
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
                <Coins className="h-4 w-4 text-muted-foreground" aria-hidden />
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



          {/* Submit for verification section */}
          {canSubmit ? (
            <div className="pt-2 border-t border-border">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Orders to Submit
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const remainingOrders = task.maxOrders - task.completedOrders;
                        setPendingOrders(prev => Math.max(1, prev - 1));
                      }}
                      className="bg-[#690003] text-white size-8 rounded-md flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={task.maxOrders - task.completedOrders}
                      value={pendingOrders}
                      onChange={(e) => {
                        const remainingOrders = task.maxOrders - task.completedOrders;
                        const newValue = parseInt(e.target.value) || 1;
                        setPendingOrders(Math.max(1, Math.min(newValue, remainingOrders)));
                      }}
                      className="w-20 remove-arrow rounded-md border border-gray-300 bg-card px-3 py-2 text-sm text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const remainingOrders = task.maxOrders - task.completedOrders;
                        setPendingOrders(prev => Math.min(remainingOrders, prev + 1));
                      }}
                      className="bg-[#690003] text-white size-8 rounded-md flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remaining: {task.maxOrders - task.completedOrders} orders
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-foreground text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
              </div>
            </div>
          ) : null}

          {/* Redo task section */}
          {canRedo ? (
            <div className="pt-2 border-t border-border">
              <div className="space-y-3">
                <p className="text-sm text-amber-600">
                  This task was rejected. You can redo it and submit again for verification.
                </p>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
          ) : null}

          {/* Claim points section */}
          {canClaim ? (
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
            </div>
          ) : isFullyCompletedAndClaimed ? (
            <p className="text-sm text-muted-foreground pt-2 border-t border-border">
              Points and XP have already been claimed.
            </p>
          ) : null}

          {submitMutation.isSuccess ? (
            <p className="text-sm text-green-600 pt-2 border-t border-border">
              Task submitted for verification successfully!
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}