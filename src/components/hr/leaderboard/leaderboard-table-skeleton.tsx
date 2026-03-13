import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LeaderboardTableSkeleton() {
  return (
    <div className="mb-2 w-full">
      <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44 rounded sm:h-7 sm:w-48" />
          <Skeleton className="h-3.5 w-28 rounded sm:h-4 sm:w-36" />
        </div>
        <Skeleton className="h-10 w-36 rounded sm:h-9 sm:w-28" />
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-150 sm:min-w-190">
            <TableHeader>
              <TableRow className="bg-primary-gradient border-0 hover:opacity-95">
                <TableHead className="w-10 pl-1 pr-1 sm:w-20 sm:pl-5 sm:pr-4">
                  <Skeleton className="h-3.5 w-9 rounded bg-white/20 sm:h-4 sm:w-10" />
                </TableHead>
                <TableHead className="pl-1 sm:pl-0">
                  <Skeleton className="h-3.5 w-12 rounded bg-white/20 sm:h-4 sm:w-14" />
                </TableHead>
                <TableHead className="pr-1.5 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-14 rounded bg-white/20 sm:h-4 sm:w-36" />
                </TableHead>
                <TableHead className="pr-1.5 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-16 rounded bg-white/20 sm:h-4 sm:w-20" />
                </TableHead>
                <TableHead className="pr-1.5 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-16 rounded bg-white/20 sm:h-4 sm:w-20" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-5">
                  <Skeleton className="ml-auto h-3.5 w-20 rounded bg-white/20 sm:h-4 sm:w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="bg-accent/5 border-0">
                  <TableCell className="pl-1 pr-1 sm:pl-5 sm:pr-4">
                    <Skeleton className="h-5 w-8 rounded sm:h-6 sm:w-10" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-3">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-10 sm:w-10" />
                      <Skeleton className="h-3.5 w-24 rounded sm:h-5 sm:w-40" />
                    </div>
                  </TableCell>
                  <TableCell className="pr-1.5 text-right sm:pr-4">
                    <Skeleton className="ml-auto h-5 w-14 rounded sm:h-6 sm:w-16" />
                  </TableCell>
                  <TableCell className="pr-1.5 text-right sm:pr-4">
                    <Skeleton className="ml-auto h-5 w-14 rounded sm:h-6 sm:w-16" />
                  </TableCell>
                  <TableCell className="pr-1.5 text-right sm:pr-4">
                    <Skeleton className="ml-auto h-5 w-14 rounded sm:h-6 sm:w-16" />
                  </TableCell>
                  <TableCell className="pr-2 text-right sm:pr-5">
                    <Skeleton className="ml-auto h-6 w-16 rounded sm:h-7 sm:w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
