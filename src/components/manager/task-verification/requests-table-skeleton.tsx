import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="border-b border-border bg-muted">
            <TableHead className="px-4 w-45">
              <Skeleton className="h-4 w-24 bg-gray-300" />
            </TableHead>
            <TableHead className="px-4 w-50">
              <Skeleton className="h-4 w-20 bg-gray-300" />
            </TableHead>
            <TableHead className="px-4 w-64">
              <Skeleton className="h-4 w-16 bg-gray-300" />
            </TableHead>
            <TableHead className="text-center px-4 w-40">
              <Skeleton className="h-4 w-20 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-12 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-10 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="text-center px-4 w-20">
              <Skeleton className="h-4 w-16 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="text-center px-4 w-30">
              <Skeleton className="h-4 w-14 bg-gray-300 mx-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background-soft">
              <TableCell className="px-4">
                <div className="h-4 w-28 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-20 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-8 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-16 bg-gray-300 rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
