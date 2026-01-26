import { Suspense } from 'react';
import { RewardRequestsContent } from '@/components/hr/reward-requests/reward-requests-content';

export default function RewardRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fff8f5] p-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#5a2a2a]">Loading redemption requests...</p>
            </div>
          </div>
        </div>
      }
    >
      <RewardRequestsContent />
    </Suspense>
  );
}
