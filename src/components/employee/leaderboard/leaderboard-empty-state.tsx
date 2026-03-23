export function LeaderboardEmptyState() {
  return (
    <div className="px-3 py-8 text-center sm:px-4 sm:py-10">
      <p className="text-balance font-jersey text-2xl tracking-[0.14em] text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl md:text-4xl lg:text-5xl">
        Rankings haven&apos;t been released yet.
      </p>
      <p className="mt-2 text-balance font-jersey text-lg tracking-[0.12em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl lg:text-3xl">
        Check back later!
      </p>
    </div>
  );
}
