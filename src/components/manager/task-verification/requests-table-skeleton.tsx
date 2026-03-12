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
        <TableHeader className="bg-background">
          <TableRow className="border-b border-border bg-background">
            <TableHead className="hidden sm:table-cell px-2 sm:px-4 w-24 sm:w-40">
              <Skeleton className="h-4 w-20 sm:w-24 bg-gray-300" />
            </TableHead>
            <TableHead className="px-2 sm:px-4 w-28 sm:w-44">
              <Skeleton className="h-4 w-16 sm:w-20 bg-gray-300" />
            </TableHead>
            <TableHead className="px-2 sm:px-4 w-32 sm:w-56">
              <Skeleton className="h-4 w-14 sm:w-16 bg-gray-300" />
            </TableHead>
            <TableHead className="hidden md:table-cell text-center px-2 sm:px-4 w-20 sm:w-28">
              <Skeleton className="h-4 w-16 sm:w-20 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="hidden lg:table-cell text-center px-2 sm:px-4 w-14">
              <Skeleton className="h-4 w-8 sm:w-12 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="hidden lg:table-cell text-center px-2 sm:px-4 w-14">
              <Skeleton className="h-4 w-6 sm:w-10 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="hidden sm:table-cell text-center px-2 sm:px-4 w-12 sm:w-16">
              <Skeleton className="h-4 w-10 sm:w-16 bg-gray-300 mx-auto" />
            </TableHead>
            <TableHead className="text-center px-2 sm:px-4 w-24 sm:w-28">
              <Skeleton className="h-4 w-9 sm:w-14 bg-gray-300 mx-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background-soft hover:bg-background-soft">
              <TableCell className="hidden sm:table-cell px-2 sm:px-4">
                <div className="h-4 w-20 sm:w-28 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="h-4 w-24 sm:w-32 bg-gray-300 rounded animate-pulse" />
                <div className="mt-2 h-3 w-16 sm:w-20 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="h-4 w-32 sm:w-40 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="hidden md:table-cell px-2 sm:px-4">
                <div className="mx-auto h-4 w-16 sm:w-20 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="hidden lg:table-cell px-2 sm:px-4">
                <div className="mx-auto h-4 w-10 sm:w-12 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="hidden lg:table-cell px-2 sm:px-4">
                <div className="mx-auto h-4 w-10 sm:w-12 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="hidden sm:table-cell px-1 sm:px-4">
                <div className="mx-auto h-4 w-6 sm:w-8 bg-gray-300 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="mx-auto h-4 w-12 sm:w-16 bg-gray-300 rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
