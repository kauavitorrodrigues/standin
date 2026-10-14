import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export const AreasLoadingState = () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
        {SKELETON_KEYS.map((key) => (
            <div
                key={key}
                className="flex flex-col gap-3 rounded-lg border p-3"
            >
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        ))}
    </div>
);
