import { Award } from 'lucide-react';

interface AwardSuspenseProps {
  label?: string;
}

export function AwardSuspense({ label = 'Loading...' }: AwardSuspenseProps) {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 py-8">
        <Award className="animate-bounce size-10 text-[#690003]" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  );
}
