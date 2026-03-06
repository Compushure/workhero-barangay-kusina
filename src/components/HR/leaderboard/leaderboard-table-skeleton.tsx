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
    <div className="mb-2">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between max-w-6xl mx-auto">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded" />
      </div>

    <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden max-w-6xl mx-auto">

      <Table>
        <TableHeader>
          
          <TableRow className="bg-primary-gradient border-0 hover:opacity-95">
            <TableHead className="w-20 pl-6 pr-8">
              <Skeleton className="h-4 w-10 rounded bg-white/20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-14 rounded bg-white/20" />
            </TableHead>
            <TableHead className="text-right pr-6">
              <Skeleton className="h-4 w-36 rounded bg-white/20 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className="bg-accent/5 border-0">
              <TableCell className="pl-6 pr-8">
                <Skeleton className="h-6 w-10 rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-40 rounded" />
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Skeleton className="h-7 w-20 rounded ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
