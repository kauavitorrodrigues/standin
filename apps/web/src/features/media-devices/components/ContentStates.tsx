import { Skeleton } from "@/components/ui/skeleton";

export const DeviceMenuLoadingState = () => (
    <div className="flex flex-col gap-2 px-1.5 py-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
    </div>
);

export const DeviceMenuEmptyState = () => (
    <div className="px-1.5 py-1 text-sm text-muted-foreground">
        Nenhum dispositivo encontrado
    </div>
);
