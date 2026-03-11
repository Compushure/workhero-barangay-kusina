import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function BadgeTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="bg-background-soft border-b border-accent/50">
          <TableCell className="py-2 sm:py-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2 pl-3 sm:pl-4">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 bg-background" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-background" />
                <Skeleton className="h-3 w-48 bg-background" />
                <Skeleton className="h-4 w-24 bg-background" />
              </div>
            </div>
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-background" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-background" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 mx-auto w-15 bg-background" />
          </TableCell>

          <TableCell>
            <div className="flex justify-center gap-0.5 sm:gap-1">
              <Skeleton className="size-8 sm:size-10 bg-background" />
              <Skeleton className="size-8 sm:size-10 bg-background" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
