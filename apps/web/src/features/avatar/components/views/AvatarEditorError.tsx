import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type AvatarEditorErrorProps = { onRetry: () => void };

// The editor did not load.
export const AvatarEditorError = ({ onRetry }: AvatarEditorErrorProps) => (
    <div className="flex h-[34rem] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
            Não foi possível carregar o editor de avatar.
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
