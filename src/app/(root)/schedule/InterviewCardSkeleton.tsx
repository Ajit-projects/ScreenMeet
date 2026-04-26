import { Skeleton } from "@/components/ui/skeleton";

function InterviewCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />

      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export default InterviewCardSkeleton;