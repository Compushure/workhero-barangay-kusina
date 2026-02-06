import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";


export default function TaskTableSkeleton() {
  return (
    <>
    {[1, 2, 3, 4, 5].map((i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="space-y-2 pl-4">
            <Skeleton className="h-5 bg-background brightness-95 saturate-250 w-1/2"/>
            <Skeleton className="h-3 bg-background brightness-95 saturate-250 w-2/3"/>
            <Skeleton className="h-4 bg-background brightness-95 saturate-250 w-1/3"/>
          </div>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-background brightness-95 saturate-250 mx-auto w-12"/>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-background brightness-95 saturate-250 mx-auto w-12"/>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-background brightness-95 saturate-250 mx-auto w-15"/>
        </TableCell>

        <TableCell>
          <div className="flex justify-center gap-2">
            <Skeleton className="size-8 bg-background brightness-95 saturate-250"/>
            <Skeleton className="size-8 bg-background brightness-95 saturate-250"/>
          </div>
        </TableCell>
      </TableRow>
    ))}
    </>
  );
}