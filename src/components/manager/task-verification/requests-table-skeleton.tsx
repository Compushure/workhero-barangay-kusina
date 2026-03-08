import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function RequestsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader className="bg-primary-gradient">
          <TableRow className="border-b border-border hover:bg-primary-gradient">
            <TableHead className="text-card font-semibold px-4 w-45">REQUEST DATE</TableHead>
            <TableHead className="text-card font-semibold px-4 w-50">EMPLOYEE</TableHead>
            <TableHead className="text-card font-semibold px-4 w-64">TASK</TableHead>
            <TableHead className="text-card font-semibold text-center px-4 w-40">
              COMPLETED
            </TableHead>
            <TableHead className="text-card font-semibold text-center px-4 w-15">POINTS</TableHead>
            <TableHead className="text-card font-semibold text-center px-4 w-15">XP</TableHead>
            <TableHead className="text-card font-semibold text-center px-4 w-20">REMARK</TableHead>
            <TableHead className="text-card font-semibold text-center px-4 w-30">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="bg-background">
              <TableCell className="px-4">
                <div className="h-4 w-28 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-32 bg-white/60 rounded animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-white/50 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="h-4 w-40 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-20 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-12 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-8 bg-white/60 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4">
                <div className="mx-auto h-4 w-16 bg-white/60 rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
