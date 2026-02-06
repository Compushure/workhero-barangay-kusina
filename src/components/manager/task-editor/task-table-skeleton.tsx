import { TableCell, TableRow } from "@/components/ui/table";


export default function TaskTableSkeleton() {
  return (
    <>
    {[1, 2, 3, 4, 5].map((i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
        </TableCell>
        <TableCell className="text-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
        </TableCell>
        <TableCell className="text-center">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse mx-auto w-10"></div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </TableCell>
      </TableRow>
    ))}
    </>
  );
}