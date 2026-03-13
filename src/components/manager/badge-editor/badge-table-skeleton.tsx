import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function BadgeTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow
          key={i}
          className="bg-background-soft hover:bg-background-soft border-b border-gray-300"
        >
          <TableCell className="py-2 sm:py-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2 pl-3 sm:pl-4">
              <Skeleton className="size-12 sm:size-14 bg-gray-300" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-300" />
                <Skeleton className="h-3 w-48 bg-gray-300" />
                <Skeleton className="h-4 w-24 bg-gray-300" />
              </div>
            </div>
          </TableCell>

          <TableCell className="hidden lg:table-cell text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-gray-300" />
          </TableCell>

          <TableCell className="hidden lg:table-cell text-center">
            <Skeleton className="h-6 mx-auto w-12 bg-gray-300" />
          </TableCell>

          <TableCell className="hidden md:table-cell text-center">
            <Skeleton className="h-6 mx-auto w-15 bg-gray-300" />
          </TableCell>

          <TableCell>
            <div className="flex justify-center gap-0.5 sm:gap-1">
              <Skeleton className="h-9 w-9 rounded-md bg-gray-300" />
              <Skeleton className="h-9 w-9 rounded-md bg-gray-300" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
