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
    <div className="overflow-x-auto rounded-lg border border-border shadow-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader className="bg-background">
          <TableRow className="border-b border-border hover:bg-background">
            <TableHead className="px-2 sm:px-4 w-32 sm:w-40 text-xs sm:text-sm">
              <Skeleton className="h-4 w-20 bg-background" />
            </TableHead>
            <TableHead className="px-2 sm:px-4 w-36 sm:w-48 text-xs sm:text-sm">
              <Skeleton className="h-4 w-16 bg-background" />
            </TableHead>
            <TableHead className="px-2 sm:px-4 w-48 sm:w-64 text-xs sm:text-sm">
              <Skeleton className="h-4 w-28 bg-background" />
            </TableHead>
            <TableHead className="text-center px-2 sm:px-4 w-20 sm:w-28 text-xs sm:text-sm">
              <Skeleton className="h-4 w-14 mx-auto bg-background" />
            </TableHead>
            <TableHead className="text-center px-2 sm:px-4 w-28 sm:w-32 text-xs sm:text-sm sticky right-0 bg-background">
              <Skeleton className="h-4 w-14 mx-auto bg-background" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background">
              <TableCell className="px-2 sm:px-4">
                <div className="h-4 w-24 sm:w-30 bg-background rounded animate-pulse" />
                <div className="mt-1 h-3 w-16 sm:w-20 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="h-4 w-24 sm:w-32 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="h-4 w-32 sm:w-40 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="mx-auto h-4 w-14 sm:w-18 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4 sticky right-0 bg-background">
                <div className="mx-auto h-7 w-18 sm:w-22 bg-background rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
