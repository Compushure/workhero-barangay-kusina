'use client';

import { useMemo, useState } from 'react';
import { Bug, Minus, Plus, RefreshCw, X } from 'lucide-react';
import { useAdjustActiveUserXPByDelta } from '@/hooks/tanstack/mutations/employeeStatsMutations';
import { useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';

const DELTA_BUTTONS = [-100, -25, -10, 10, 25, 100];

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export default function LevelXPDebuggerPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [customDelta, setCustomDelta] = useState(10);
  const { data: xpData, refetch, isFetching } = useGetEmployeeXP();
  const adjustXP = useAdjustActiveUserXPByDelta();

  const summary = useMemo(() => {
    return {
      level: xpData?.level ?? 1,
      currentXP: xpData?.currentXP ?? 0,
      totalXP: xpData?.totalXP ?? 0,
    };
  }, [xpData]);

  const runAdjust = (delta: number) => {
    if (!delta || adjustXP.isPending) return;
    adjustXP.mutate(delta);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#7a3510] text-white px-4 py-3 rounded-lg shadow-lg hover:bg-[#8d3f13] flex items-center gap-2 font-medium"
        >
          <Bug className="w-4 h-4" />
          <span>XP Debug</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[340px] max-h-[85vh] bg-white border border-[#7a3510]/30 rounded-lg shadow-2xl z-50 flex flex-col">
      <div className="bg-[#7a3510] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Level XP Debugger</h2>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Development helper for active user XP and level testing.
        </div>

        <div className="rounded border p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Level</span>
            <span className="font-semibold">{summary.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current XP</span>
            <span className="font-semibold">{summary.currentXP}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total XP</span>
            <span className="font-semibold">{summary.totalXP}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DELTA_BUTTONS.map((delta) => (
            <button
              key={delta}
              onClick={() => runAdjust(delta)}
              disabled={adjustXP.isPending}
              className="h-9 rounded border text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              {delta > 0 ? <Plus className="inline w-3 h-3 mr-1" /> : <Minus className="inline w-3 h-3 mr-1" />}
              {formatSigned(delta)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-600">Custom delta</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="h-9 w-full rounded border px-2 text-sm"
              value={customDelta}
              onChange={(e) => setCustomDelta(Number(e.target.value || 0))}
            />
            <button
              onClick={() => runAdjust(customDelta)}
              disabled={adjustXP.isPending || customDelta === 0}
              className="h-9 rounded bg-[#7a3510] px-3 text-white text-xs hover:bg-[#8d3f13] disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 rounded border px-3 text-xs hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
