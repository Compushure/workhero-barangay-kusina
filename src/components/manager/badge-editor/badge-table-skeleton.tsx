import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function BadgeTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="bg-background-soft border-b border-accent/50">
          <TableCell className="py-8">
            <div className="flex items-baseline gap-4 pl-4">
              <Skeleton className="size-14 bg-muted" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-muted" />
                <Skeleton className="h-3 w-48 bg-muted" />
                <Skeleton className="h-4 w-24 bg-muted" />
              </div>
            </div>
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-muted" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-muted" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-15 bg-muted" />
          </TableCell>

          <TableCell>
            <div className="flex justify-center gap-2">
              <Skeleton className="size-8 bg-muted" />
              <Skeleton className="size-8 bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
