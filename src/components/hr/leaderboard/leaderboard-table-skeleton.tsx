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
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/40">
        <div className="flex flex-col gap-3 border-b border-border bg-background-soft px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded bg-gray-300" />
            <div className="flex items-end gap-2">
              <Skeleton className="h-8 w-36 rounded bg-gray-300 sm:w-44" />
              <Skeleton className="h-4 w-28 rounded bg-gray-300" />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-248">
            <TableHeader>
              <TableRow className="bg-primary-gradient border-0">
                <TableHead className="w-10 px-2 text-center sm:w-16 sm:px-4">
                  <Skeleton className="mx-auto h-3.5 w-10 rounded bg-gray-300/80" />
                </TableHead>
                <TableHead className="px-2 sm:px-4">
                  <Skeleton className="h-3.5 w-20 rounded bg-gray-300/80" />
                </TableHead>
                <TableHead className="px-2 text-center sm:px-4">
                  <Skeleton className="mx-auto h-3.5 w-24 rounded bg-gray-300/80" />
                </TableHead>
                <TableHead className="px-2 text-center sm:px-4">
                  <Skeleton className="mx-auto h-3.5 w-20 rounded bg-gray-300/80" />
                </TableHead>
                <TableHead className="px-2 text-center sm:px-4">
                  <Skeleton className="mx-auto h-3.5 w-20 rounded bg-gray-300/80" />
                </TableHead>
                <TableHead className="px-2 text-center sm:px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <Skeleton className="h-3.5 w-28 rounded bg-gray-300/80" />
                    <Skeleton className="h-4 w-4 rounded-full bg-gray-300/80" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-0 bg-background-soft hover:bg-background-soft">
                  <TableCell className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                    <Skeleton className="mx-auto h-6 w-8 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                    <div className="flex items-center justify-start gap-2 sm:gap-2.5">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-gray-300 sm:h-10 sm:w-10" />
                      <Skeleton className="h-4 w-36 rounded bg-gray-300 sm:w-48" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <Skeleton className="mx-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <Skeleton className="mx-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <Skeleton className="mx-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-3 text-center sm:py-3.5 sm:pr-5">
                    <Skeleton className="mx-auto h-4 w-20 rounded bg-gray-300" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="h-9 rounded-full bg-transparent" />
    </div>
  );
}
