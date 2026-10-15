import { Loader2 } from "lucide-react";

export const TilesetsLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);
