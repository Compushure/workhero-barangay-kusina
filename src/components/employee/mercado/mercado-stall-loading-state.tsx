'use client';

interface MercadoStallLoadingStateProps {
  message?: string;
}

export function MercadoStallLoadingState({
  message = 'Loading stalls...',
}: MercadoStallLoadingStateProps) {
  return (
    <div className="flex w-full flex-1 min-w-0 items-center justify-center px-4 py-8 lg:fixed lg:inset-0 lg:z-20 lg:px-0 lg:py-0">
      <div className="inline-flex w-fit max-w-[calc(100vw-2rem)] -translate-y-10 flex-col items-center gap-3 rounded-3xl border-2 border-[#47331F]/70 bg-[#e8dbbf]/90 px-4 py-4 text-center shadow-[4px_4px_0px_rgba(71,51,31,0.35)] sm:-translate-y-12 md:-translate-y-14 lg:translate-y-0 lg:flex-row lg:justify-center lg:gap-4 lg:px-4 lg:py-5">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d2b07d] border-t-[#47331F]" />
        <p className="text-sm font-bold text-[#47331F]">{message}</p>
      </div>
    </div>
  );
}
