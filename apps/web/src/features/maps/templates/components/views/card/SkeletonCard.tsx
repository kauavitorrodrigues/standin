import { Skeleton } from "@/components/ui/skeleton";

export const TemplateSkeletonCard = () => (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
    </div>
);
