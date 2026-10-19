import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PartGridErrorProps = { onRetry: () => void };

// The first page of a category did not load.
export const PartGridError = ({ onRetry }: PartGridErrorProps) => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">
            Não foi possível carregar as peças.
        </p>
        <Button
            type="button"
            variant="outline"
            icon={RotateCwIcon}
            onClick={onRetry}
        >
            Tentar de novo
        </Button>
    </div>
);
