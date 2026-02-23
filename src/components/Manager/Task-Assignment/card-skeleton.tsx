import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <Card className="w-full h-48 mb-4">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full h-16" />
      </CardContent>
    </Card>
  )
}

export function SkeletonRow() {
  return (
    <Card className="w-full py-4 rounded-none">
      <CardContent>
        <Skeleton className="w-full h-8" />
      </CardContent>
    </Card>
  )
}
