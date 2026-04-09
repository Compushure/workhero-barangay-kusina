import { isTaskOverdue } from '@/utils/date-utils';
import {
  CalendarX2,
  CircleCheck,
  CircleDashed,
  CircleX,
  HandCoins,
  Target,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { TaskStatusItem, TaskStatusKind } from './types';

export type ApprovedTaskState =
  | 'unclaimed-with-remaining'
  | 'claimed-with-remaining'
  | 'unclaimed-no-remaining'
  | 'claimed-no-remaining-unserved'
  | 'claimed-no-remaining-served';

type NormalizedTaskStatus = 'assigned' | 'in review' | 'approved' | 'rejected';

interface TaskBaseStatusChipMeta {
  label: string;
  className: string;
  icon: LucideIcon;
}

interface TaskSignalChipMeta {
  label: string;
  className: string;
  icon: LucideIcon;
}

const STATUS_CHIP_META: Record<NormalizedTaskStatus, TaskBaseStatusChipMeta> = {
  assigned: {
    label: 'Current',
    className: 'border-[#87a9bc] bg-[#d7e3f4] text-[#204b61]',
    icon: CircleDashed,
  },
  'in review': {
    label: 'In Review',
    className: 'border-[#c79a54] bg-[#f5e0ba] text-[#733e0a]',
    icon: Target,
  },
  approved: {
    label: 'Approved',
    className: 'border-[#7eb07f] bg-[#d8efdb] text-[#1f5a36]',
    icon: CircleCheck,
  },
  rejected: {
    label: 'Rejected',
    className: 'border-[#d18d7e] bg-[#f4d6ce] text-[#8b2e22]',
    icon: CircleX,
  },
};

const SECTION_STATUS_TO_NORMALIZED: Record<TaskStatusKind, NormalizedTaskStatus> = {
  Current: 'assigned',
  'In Review': 'in review',
  Approved: 'approved',
  Rejected: 'rejected',
};

const FALLBACK_STATUS_CHIP_META: TaskBaseStatusChipMeta = {
  label: 'Task',
  className: 'border-[#d4c5a8] bg-[#efe2ca] text-[#6b5038]',
  icon: CircleDashed,
};

const SIGNAL_CHIP_META: Record<'overdue' | 'claimed' | 'served', TaskSignalChipMeta> = {
  overdue: {
    label: 'Overdue',
    className: 'border-[#d18d7e] bg-[#f4d6ce] text-[#8b2e22]',
    icon: CalendarX2,
  },
  claimed: {
    label: 'Claimed',
    className: 'border-[#d19a47] bg-[#ffdead] text-[#8c5707]',
    icon: HandCoins,
  },
  served: {
    label: 'Served',
    className: 'border-[#a684ff] bg-[#ddd6ff] text-[#4d179a]',
    icon: Utensils,
  },
};

export interface TaskLifecycleState {
  normalizedStatus: NormalizedTaskStatus | null;
  isAssignedTask: boolean;
  isRejectedTask: boolean;
  isApprovedTask: boolean;
  isInReviewTask: boolean;
  remainingOrders: number;
  hasRemainingOrders: boolean;
  hasNoRemainingOrders: boolean;
  isClaimedForCurrentApproval: boolean;
  isServed: boolean;
  approvedTaskState: ApprovedTaskState | null;
  showOverdueChip: boolean;
  showClaimedChip: boolean;
  showServedChip: boolean;
}

export function normalizeTaskStatus(status?: string | null): NormalizedTaskStatus | null {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'assigned';
    case 'in review':
      return 'in review';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return null;
  }
}

export function getTaskRemainingOrders(
  task: Pick<TaskStatusItem, 'maxOrders' | 'completedOrders'>
): number {
  return Math.max(0, task.maxOrders - task.completedOrders);
}

export function getTaskBaseStatusChipMeta(status?: string | null): TaskBaseStatusChipMeta {
  const normalizedStatus = normalizeTaskStatus(status);
  if (!normalizedStatus) return FALLBACK_STATUS_CHIP_META;

  return STATUS_CHIP_META[normalizedStatus];
}

export function getTaskSectionStatusChipMeta(status: TaskStatusKind): TaskBaseStatusChipMeta {
  return STATUS_CHIP_META[SECTION_STATUS_TO_NORMALIZED[status]];
}

export function getTaskSectionAccentClassName(status: TaskStatusKind): string {
  return getTaskSectionStatusChipMeta(status).className;
}

export function getTaskSignalChipMeta(kind: 'overdue' | 'claimed' | 'served'): TaskSignalChipMeta {
  return SIGNAL_CHIP_META[kind];
}

export function deriveTaskLifecycleState(
  task: Pick<
    TaskStatusItem,
    'status' | 'pendingOrders' | 'maxOrders' | 'completedOrders' | 'completedAt'
  >,
  isOverdue: boolean
): TaskLifecycleState {
  const normalizedStatus = normalizeTaskStatus(task.status);
  const isAssignedTask = normalizedStatus === 'assigned';
  const isRejectedTask = normalizedStatus === 'rejected';
  const isApprovedTask = normalizedStatus === 'approved';
  const isInReviewTask = normalizedStatus === 'in review';

  const remainingOrders = getTaskRemainingOrders(task);
  const hasRemainingOrders = remainingOrders > 0;
  const hasNoRemainingOrders = !hasRemainingOrders;

  // For the current approved batch, claim-state is driven by pending orders.
  const isClaimedForCurrentApproval = isApprovedTask && task.pendingOrders === 0;
  // Served-state is driven by completion timestamp from kitchen flow.
  const isServed = Boolean(task.completedAt);

  let approvedTaskState: ApprovedTaskState | null = null;
  if (isApprovedTask) {
    if (!isClaimedForCurrentApproval && hasRemainingOrders) {
      approvedTaskState = 'unclaimed-with-remaining';
    } else if (isClaimedForCurrentApproval && hasRemainingOrders) {
      approvedTaskState = 'claimed-with-remaining';
    } else if (!isClaimedForCurrentApproval && hasNoRemainingOrders) {
      approvedTaskState = 'unclaimed-no-remaining';
    } else if (isServed) {
      approvedTaskState = 'claimed-no-remaining-served';
    } else {
      approvedTaskState = 'claimed-no-remaining-unserved';
    }
  }

  return {
    normalizedStatus,
    isAssignedTask,
    isRejectedTask,
    isApprovedTask,
    isInReviewTask,
    remainingOrders,
    hasRemainingOrders,
    hasNoRemainingOrders,
    isClaimedForCurrentApproval,
    isServed,
    approvedTaskState,
    showOverdueChip: isOverdue,
    showClaimedChip: isClaimedForCurrentApproval,
    showServedChip: isServed,
  };
}

export function isIncompleteTask(task: Pick<TaskStatusItem, 'completedOrders' | 'maxOrders'>): boolean {
  return task.completedOrders < task.maxOrders;
}

export function isTaskStatusItemOverdue(
  task: Pick<TaskStatusItem, 'dueDate' | 'completedOrders' | 'maxOrders'>
): boolean {
  return isIncompleteTask(task) && isTaskOverdue(task.dueDate);
}
