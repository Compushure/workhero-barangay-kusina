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
    <div className="w-full space-y-4">
      <div className="flex w-full flex-col gap-3 rounded-3xl border border-accent/20 bg-card px-5 py-4 shadow-sm/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-full bg-gray-300 sm:h-5 sm:w-40" />
          <Skeleton className="h-6 w-48 rounded-full bg-gray-300 sm:h-7 sm:w-60" />
          <Skeleton className="h-4 w-32 rounded-full bg-gray-300" />
        </div>
        <Skeleton className="control-h w-48 rounded-full bg-gray-300 sm:w-56" />
      </div>

      <div className="w-full overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-sm/40">
        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-248">
            <TableHeader>
              <TableRow className="bg-primary-gradient border-0">
                <TableHead className="w-10 pl-2 pr-2 sm:w-20 sm:pl-6 sm:pr-4">
                  <Skeleton className="h-3.5 w-10 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pl-1 sm:pl-0">
                  <Skeleton className="h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-5">
                  <Skeleton className="ml-auto h-3.5 w-28 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-5">
                  <Skeleton className="ml-auto h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-5">
                  <Skeleton className="ml-auto h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-6">
                  <Skeleton className="ml-auto h-3.5 w-28 rounded bg-gray-300" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-0 bg-background-soft hover:bg-background-soft">
                  <TableCell className="py-3 pl-2 pr-2 sm:py-4 sm:pl-6 sm:pr-5">
                    <Skeleton className="h-6 w-12 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-gray-300 sm:h-12 sm:w-12" />
                      <Skeleton className="h-4 w-40 rounded bg-gray-300 sm:h-5 sm:w-56" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <Skeleton className="ml-auto h-5 w-20 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <Skeleton className="ml-auto h-5 w-20 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <Skeleton className="ml-auto h-5 w-20 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-3 pr-3 text-right sm:py-4 sm:pr-6">
                    <Skeleton className="ml-auto h-5 w-24 rounded bg-gray-300" />
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
