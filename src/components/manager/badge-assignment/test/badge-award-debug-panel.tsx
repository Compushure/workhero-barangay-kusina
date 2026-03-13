'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Info, XCircle, RefreshCw, Bug } from 'lucide-react';
import { useGetBadgeAwardDebugEntries } from '@/hooks/tanstack/queries/managerBadgeAssignmentQueries';
import { useRemoveBadgeAward } from '@/hooks/tanstack/mutations/managerBadgeAssignmentMutations';
import type { BadgeAwardDebugEntry } from '@/types/manager/badge-assignment';

const getLogIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-3 h-3" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3" />;
    case 'error':
      return <XCircle className="w-3 h-3" />;
    default:
      return <Info className="w-3 h-3" />;
  }
};

const getLogColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEntryType = (entry: BadgeAwardDebugEntry) => {
  if (!entry.badge_points) return 'info';
  return 'success';
};

export default function BadgeAwardDebugPanel() {
  const { data: entries = [], isLoading, refetch } = useGetBadgeAwardDebugEntries();
  const removeAwardMutation = useRemoveBadgeAward();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#690003] text-white px-4 py-3 rounded-lg shadow-lg hover:bg-[#7a0004] flex items-center gap-2 font-medium"
        >
          <Bug className="w-4 h-4" />
          <span>Debug Logs</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-130 max-h-[90vh] bg-white border border-[#690003]/20 rounded-lg shadow-2xl z-50 flex flex-col">
      <div className="bg-[#690003] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Badge Debug Logs</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/10 rounded p-1"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#690003]">Badge Award Debug Logs</h3>
            <p className="text-xs text-gray-600">
              Temporary diagnostics for badge awards and point changes.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="h-8 rounded border border-[#690003]/30 px-3 text-xs text-[#690003] hover:bg-[#690003]/5 flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="rounded-lg border border-[#e0cfcf] bg-white p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" /> Loading debug entries...
            </div>
          ) : entries.length === 0 ? (
            <p className="text-xs text-gray-500">No badge awards found.</p>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto space-y-2">
              {entries.map((entry) => {
                const type = getEntryType(entry);
                return (
                  <div
                    key={entry.id}
                    className={`border rounded p-3 text-xs ${getLogColor(type)}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getLogIcon(type)}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            {entry.badge_name}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatTimestamp(entry.date_acquired)}
                          </span>
                        </div>
                        <p>
                          Awarded to <span className="font-semibold">{entry.awarded_to_name}</span>
                          {entry.employee_id ? ` (${entry.employee_id})` : ''}
                        </p>
                        <p>
                          Badge points: <span className="font-semibold">{entry.badge_points}</span> | User points now:{' '}
                          <span className="font-semibold">{entry.user_points}</span>
                        </p>
                        <p className="text-[10px] text-gray-600">
                          Awarded by: {entry.awarded_by_name || 'System Default'}
                        </p>
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              if (removeAwardMutation.isPending) return;
                              const confirmed = window.confirm(
                                'Remove this badge award and reverse the points?'
                              );
                              if (!confirmed) return;
                              removeAwardMutation.mutate(
                                { awardId: entry.id },
                                { onSuccess: () => refetch() }
                              );
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700"
                          >
                            Remove award
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
