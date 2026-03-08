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
          <TableRow className="border-b border-border hover:bg-background">
            <TableHead className="px-4 w-45">
              <Skeleton className="h-4 w-24 bg-muted" />
            </TableHead>
            <TableHead className="px-4 w-50">
              <Skeleton className="h-4 w-20 bg-muted" />
            </TableHead>
            <TableHead className="px-4 w-64">
              <Skeleton className="h-4 w-16 bg-muted" />
            </TableHead>
            <TableHead className="text-center px-4 w-40">
              <Skeleton className="h-4 w-20 mx-auto bg-muted" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-10 mx-auto bg-muted" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-8 mx-auto bg-muted" />
            </TableHead>
            <TableHead className="text-center px-4 w-20">
              <Skeleton className="h-4 w-14 mx-auto bg-muted" />
            </TableHead>
            <TableHead className="text-center px-4 w-30">
              <Skeleton className="h-4 w-14 mx-auto bg-muted" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background">
              <TableCell className="px-4">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-8 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-16 bg-muted rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
