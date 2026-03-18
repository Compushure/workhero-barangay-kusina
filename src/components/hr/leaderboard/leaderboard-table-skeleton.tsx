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
      <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-accent/20 bg-card px-4 py-3 shadow-sm/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded-full bg-gray-300 sm:w-36" />
          <Skeleton className="h-6 w-44 rounded-full bg-gray-300 sm:w-56" />
          <Skeleton className="h-4 w-32 rounded-full bg-gray-300" />
        </div>
        <Skeleton className="control-h w-44 rounded-full bg-gray-300 sm:w-52" />
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/40">
        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-248">
            <TableHeader>
              <TableRow className="bg-background border-0">
                <TableHead className="w-10 pl-2 pr-2 sm:w-16 sm:pl-5 sm:pr-3">
                  <Skeleton className="h-3.5 w-10 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pl-1 sm:pl-0">
                  <Skeleton className="h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-4">
                  <Skeleton className="ml-auto h-3.5 w-24 rounded bg-gray-300" />
                </TableHead>
                <TableHead className="pr-2 text-right sm:pr-5">
                  <Skeleton className="ml-auto h-3.5 w-28 rounded bg-gray-300" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-0 bg-background-soft hover:bg-background-soft">
                  <TableCell className="py-2.5 pl-2 pr-2 sm:py-3.5 sm:pl-5 sm:pr-4">
                    <Skeleton className="h-6 w-12 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 sm:py-3.5">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-gray-300 sm:h-10 sm:w-10" />
                      <Skeleton className="h-4 w-36 rounded bg-gray-300 sm:w-48" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-right sm:py-3.5 sm:pr-4">
                    <Skeleton className="ml-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-right sm:py-3.5 sm:pr-4">
                    <Skeleton className="ml-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-2 text-right sm:py-3.5 sm:pr-4">
                    <Skeleton className="ml-auto h-4 w-16 rounded bg-gray-300" />
                  </TableCell>
                  <TableCell className="py-2.5 pr-3 text-right sm:py-3.5 sm:pr-5">
                    <Skeleton className="ml-auto h-4 w-20 rounded bg-gray-300" />
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
