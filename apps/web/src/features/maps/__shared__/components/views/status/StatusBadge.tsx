import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDITOR_STATUS_KIND } from "@/features/maps/__shared__/consts/editor-status-kind";
import { StatusPill } from "@/features/maps/__shared__/components/views/status/StatusPill";
import type { EditorBadgeStatus } from "@/features/maps/__shared__/types/editor-badge-status";

type StatusBadgeProps = {
    status: EditorBadgeStatus;
    // Shown only in the error state.
    onRetry?: () => void;
};

// Says where the editor stands: clean, with a draft, publishing, published,
// failed to publish or without the lock.
export const StatusBadge = ({ status, onRetry }: StatusBadgeProps) => {
    switch (status.kind) {
        case EDITOR_STATUS_KIND.CLEAN:
            return (
                <StatusPill className="bg-muted text-muted-foreground">
                    Sem alterações
                </StatusPill>
            );
        case EDITOR_STATUS_KIND.DRAFT:
            return (
                <StatusPill className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    Alterações pendentes
                </StatusPill>
            );
        case EDITOR_STATUS_KIND.PUBLISHING:
            return (
                <StatusPill className="bg-muted text-foreground">
                    <Loader2Icon className="size-3 animate-spin" />
                    Publicando...
                </StatusPill>
            );
        case EDITOR_STATUS_KIND.PUBLISHED:
            return (
                <StatusPill className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Publicado
                </StatusPill>
            );
        case EDITOR_STATUS_KIND.ERROR:
            return (
                <StatusPill className="bg-destructive/15 text-destructive">
                    Erro ao publicar
                    <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={onRetry}
                    >
                        Tentar de novo
                    </Button>
                </StatusPill>
            );
        case EDITOR_STATUS_KIND.LOCK_LOST:
            return (
                <StatusPill className="bg-destructive/15 text-destructive">
                    Trava perdida
                </StatusPill>
            );
    }
};
