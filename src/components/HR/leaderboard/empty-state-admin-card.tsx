import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getScheduleInfo, type Period } from '@/lib/leaderboard-utils';
import Link from 'next/link';

interface EmptyStateAdminCardProps {
  period: Period;
  message: string;
}

/**
 * EmptyStateAdminCard: Admin view for HR users when period rankings aren't available.
 * Shows snapshot schedule information and next update dates.
 */
export default function EmptyStateAdminCard({ period, message }: EmptyStateAdminCardProps) {
  const scheduleInfo = getScheduleInfo(period);

  return (
    <div className="flex justify-center py-8 sm:py-12">
      <div className="w-full max-w-2xl bg-[#FBF4E8] rounded-2xl border border-[#E9C496] shadow-md overflow-hidden">
        {/* Header with Trophy Icon */}
        <div className="bg-linear-to-r from-[#EBCBA8] to-[#E9C496] px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-[#6D1616]" />
          </div>
          <h3 className="text-xl font-bold text-[#6D1616]">Rankings Pending</h3>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Empty Message */}
          <p className="text-[#5a2a2a] text-base">{message}</p>

          {/* Schedule Information */}
          {scheduleInfo && (
            <div>
              <h4 className="text-sm font-semibold text-[#6D1616] uppercase tracking-wide mb-3">
                Snapshot Schedule
              </h4>
              <div className="bg-white/50 rounded-lg px-4 py-3 border border-[#E9C496]/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-[#6D1616]">
                      {period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Yearly'}:
                    </span>
                    <span className="text-sm text-[#5a2a2a] ml-2">{scheduleInfo.frequency}</span>
                  </div>
                  {scheduleInfo.nextUpdate && (
                    <div className="text-sm">
                      <span className="text-[#6D1616] font-medium">Next update: </span>
                      <span className="text-[#5a2a2a]">{scheduleInfo.nextUpdate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {period !== 'current' && (
            <div className="pt-2">
              <Link href="/hr/leaderboard?period=current">
                <Button
                  variant="default"
                  className="w-full sm:w-auto bg-[#6D1616] hover:bg-[#5a2a2a] text-white"
                >
                  View Current Rankings →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
