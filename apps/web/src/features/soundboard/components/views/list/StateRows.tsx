import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SOUNDBOARD_MESSAGES } from "../../../consts/messages";

type RetryProps = { onRetry: () => void };

export const ClipsLoadingRow = () => <Skeleton className="h-11 w-full" />;

export const ClipsMoreRow = () => (
    <p className="flex h-11 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" /> Carregando mais...
    </p>
);

export const ClipsErrorRow = ({ onRetry }: RetryProps) => (
    <div className="flex h-11 items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-xs text-destructive">
            {SOUNDBOARD_MESSAGES.LIST_FAILED}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar de novo
        </Button>
    </div>
);
