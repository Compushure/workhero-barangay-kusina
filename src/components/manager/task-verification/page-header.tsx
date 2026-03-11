export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="ml-2 mt-2">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
    </div>
  );
}
