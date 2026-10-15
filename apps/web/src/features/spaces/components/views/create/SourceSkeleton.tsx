import { Skeleton } from "@/components/ui/skeleton";

// Stands where the choices will be, with the same height, so nothing moves.
export const SourceSkeleton = () => (
    <div className="flex flex-col gap-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
    </div>
);
