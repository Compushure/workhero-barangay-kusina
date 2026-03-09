import { Cog } from 'lucide-react';

interface LoginCogSuspenseProps {
  label?: string;
}

export function LoginCogSuspense({ label = 'Loading login...' }: LoginCogSuspenseProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Cog className="size-9 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
