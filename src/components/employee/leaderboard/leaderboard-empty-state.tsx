export function LeaderboardEmptyState() {
  return (
    <div className="px-3 py-8 text-center sm:px-4 sm:py-10">
      <p className="font-jersey text-2xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl md:text-5xl lg:text-6xl">
        Rankings haven&apos;t been released yet.
      </p>
      <p className="mt-2 font-jersey text-lg tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-4xl lg:text-5xl">
        Check back later!
      </p>
    </div>
  );
}
