import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-[#fff8f5] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#690003]" />
            <p className="text-[#5a2a2a]">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
