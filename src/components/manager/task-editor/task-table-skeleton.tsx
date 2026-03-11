import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaskTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="bg-background-soft hover:bg-background-soft">
          <TableCell>
            <div className="space-y-2 pl-3 sm:pl-5">
              <Skeleton className="h-4 bg-gray-300 w-1/2" />
              <Skeleton className="h-3 bg-gray-300 w-2/3" />
              <Skeleton className="h-4 bg-gray-300 w-1/3" />
            </div>
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 bg-gray-300 mx-auto w-12" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 bg-gray-300 mx-auto w-12" />
          </TableCell>

          <TableCell className="text-center">
            <Skeleton className="h-6 bg-gray-300 mx-auto w-15" />
          </TableCell>

          <TableCell>
            <div className="flex justify-center gap-1">
              <Skeleton className="size-7 sm:size-9 bg-gray-300" />
              <Skeleton className="size-7 sm:size-9 bg-gray-300" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
