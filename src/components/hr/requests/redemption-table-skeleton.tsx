import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function RedemptionTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/25">
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader className="bg-background [&_tr]:border-0">
            <TableRow className="bg-background border-0 hover:bg-background">
              <TableHead className="px-2 sm:px-4">
                <Skeleton className="h-4 w-20 rounded bg-gray-300" />
              </TableHead>
              <TableHead className="px-2 sm:px-4">
                <Skeleton className="h-4 w-16 rounded bg-gray-300" />
              </TableHead>
              <TableHead className="px-2 sm:px-4">
                <Skeleton className="h-4 w-28 rounded bg-gray-300" />
              </TableHead>
              <TableHead className="px-2 sm:px-4 text-center">
                <Skeleton className="mx-auto h-4 w-14 rounded bg-gray-300" />
              </TableHead>
              <TableHead className="sticky right-0 px-2 sm:px-4 text-center">
                <Skeleton className="mx-auto h-4 w-14 rounded bg-gray-300" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-0">
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow
                key={index}
                className="border-0 bg-background-soft hover:bg-background-soft"
              >
                <TableCell className="px-2 sm:px-4">
                  <div className="h-4 w-24 sm:w-28 rounded bg-gray-300 animate-pulse" />
                  <div className="mt-1 h-3 w-16 sm:w-20 rounded bg-gray-300 animate-pulse" />
                </TableCell>
                <TableCell className="px-2 sm:px-4">
                  <div className="h-4 w-24 sm:w-32 rounded bg-gray-300 animate-pulse" />
                </TableCell>
                <TableCell className="px-2 sm:px-4">
                  <div className="h-4 w-32 sm:w-40 rounded bg-gray-300 animate-pulse" />
                </TableCell>
                <TableCell className="px-2 sm:px-4 text-center">
                  <div className="mx-auto h-4 w-14 sm:w-18 rounded bg-gray-300 animate-pulse" />
                </TableCell>
                <TableCell className="sticky right-0 px-2 sm:px-4">
                  <div className="mx-auto h-7 w-18 sm:w-22 rounded bg-gray-300 animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
