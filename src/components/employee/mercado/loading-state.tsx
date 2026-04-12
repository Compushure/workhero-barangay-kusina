import { Loader2 } from 'lucide-react';

// Generic Mercado loading panel used by child views.

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e8c4b0] via-[#d4a59a] to-[#b8a395] p-8 flex items-center justify-center">
      <div className="bg-[#4a2c2a] border-4 border-[#2d1b1a] rounded-lg p-12 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-16 w-16 animate-spin text-amber-400" />
          <p
            className="text-amber-100 text-2xl font-black"
            style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
          >
            {message.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
