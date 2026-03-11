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
        {/* <TableHeader className="bg-background">
          <TableRow className="border-b border-border hover:bg-background">
            <TableHead className="px-4 w-45">
              <Skeleton className="h-4 w-24 bg-background" />
            </TableHead>
            <TableHead className="px-4 w-50">
              <Skeleton className="h-4 w-20 bg-background" />
            </TableHead>
            <TableHead className="px-4 w-64">
              <Skeleton className="h-4 w-16 bg-background" />
            </TableHead>
            <TableHead className="text-center px-4 w-40">
              <Skeleton className="h-4 w-20 mx-auto bg-background" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-10 mx-auto bg-background" />
            </TableHead>
            <TableHead className="text-center px-4 w-15">
              <Skeleton className="h-4 w-8 mx-auto bg-background" />
            </TableHead>
            <TableHead className="text-center px-4 w-20">
              <Skeleton className="h-4 w-14 mx-auto bg-background" />
            </TableHead>
            <TableHead className="text-center px-4 w-30">
              <Skeleton className="h-4 w-14 mx-auto bg-background" />
            </TableHead> */}
        <TableHeader className="bg-background">
          <TableRow className="border-b border-border hover:bg-background">
            <TableHead className="text-primry/75 px-4 w-45">REQUEST DATE</TableHead>
            <TableHead className="text-primry/75 px-4 w-50">EMPLOYEE</TableHead>
            <TableHead className="text-primry/75 px-4 w-64">TASK</TableHead>
            <TableHead className="text-primry/75 text-center px-4 w-40">COMPLETED</TableHead>
            <TableHead className="text-primry/75 text-center px-4 w-15">POINTS</TableHead>
            <TableHead className="text-primry/75 text-center px-4 w-15">XP</TableHead>
            <TableHead className="text-primry/75 text-center px-4 w-20">REMARK</TableHead>
            <TableHead className="text-primry/75 text-center px-4 w-30">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background-soft">
              <TableCell className="px-4">
                <div className="h-4 w-28 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-32 bg-background rounded animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-40 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-20 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-8 bg-background rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-16 bg-background rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
