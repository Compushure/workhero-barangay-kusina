import { UserRound } from 'lucide-react';

interface UserManagementSuspenseProps {
  label?: string;
}

export function UserManagementSuspense({
  label = 'Loading user management...',
}: UserManagementSuspenseProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <UserRound className="size-9 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
