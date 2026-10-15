import { Skeleton } from "@/components/ui/skeleton";

export const PreviewSkeleton = () => (
    <div
        style={{ containerType: "size" }}
        className="flex size-full items-center justify-center"
    >
        <Skeleton className="aspect-[4/3] w-[min(75cqw,calc(75cqh*4/3))] rounded-2xl" />
    </div>
);
