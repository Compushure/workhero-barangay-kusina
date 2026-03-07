import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";


export default function TaskTableSkeleton() {
  return (
    <>
    {[1, 2, 3, 4, 5].map((i) => (
      <TableRow key={i} className="bg-background">
        <TableCell>
          <div className="space-y-2 pl-4">
            <Skeleton className="h-5 bg-muted brightness-90 w-1/2"/>
            <Skeleton className="h-3 bg-muted brightness-90 w-2/3"/>
            <Skeleton className="h-4 bg-muted brightness-90 w-1/3"/>
          </div>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-muted brightness-90 mx-auto w-12"/>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-muted brightness-90 mx-auto w-12"/>
        </TableCell>

        <TableCell className="text-center">
          <Skeleton className="h-6 bg-muted brightness-90 mx-auto w-15"/>
        </TableCell>

        <TableCell>
          <div className="flex justify-center gap-2">
            <Skeleton className="size-8 bg-muted brightness-90"/>
            <Skeleton className="size-8 bg-muted brightness-90"/>
          </div>
        </TableCell>
      </TableRow>
    ))}
    </>
  );
}