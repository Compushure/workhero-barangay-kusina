interface LeaderboardEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function LeaderboardEmptyState({
  title = "Rankings haven't been released yet.",
  subtitle = 'Check back later!',
}: LeaderboardEmptyStateProps) {
  return (
    <div className="px-3 py-8 text-center sm:px-4 sm:py-10">
      <p className="text-balance font-jersey text-2xl tracking-[0.14em] text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl md:text-4xl lg:text-5xl">
        {title}
      </p>
      <p className="mt-2 text-balance font-jersey text-lg tracking-[0.12em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl lg:text-3xl">
        {subtitle}
      </p>
    </div>
  );
}
