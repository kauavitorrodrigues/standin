import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_ROWS = [0, 1, 2];

// Rows of the size of the real ones while a list loads.
export const ListLoadingState = () => (
    <div className="flex flex-col gap-2" aria-busy="true">
        {PLACEHOLDER_ROWS.map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
        ))}
    </div>
);
