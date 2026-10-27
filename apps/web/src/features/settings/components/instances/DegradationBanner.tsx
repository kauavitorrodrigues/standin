import { useSyncExternalStore } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    degradationEffects,
    degradationNoticeStore,
} from "@/features/settings/performance/lib/degradation/DegradationEffects";
import { getDegradationCopy } from "@/features/settings/performance/lib/getDegradationCopy";

// Tells that quality was lowered. Dismissing keeps the lowered settings,
// Cancel gives the user's own settings back.
export const DegradationBanner = () => {
    const notice = useSyncExternalStore(
        degradationNoticeStore.subscribe,
        degradationNoticeStore.get
    );
    if (!notice) return null;

    const { title, description } = getDegradationCopy(
        notice.signalId,
        notice.promoted
    );

    return (
        <div
            role="status"
            className="fixed right-3 bottom-3 z-50 flex max-w-sm flex-col gap-2 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{title}</p>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Dispensar"
                    onClick={() => degradationEffects.dismiss()}
                >
                    <XIcon />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => degradationEffects.cancel()}
            >
                Cancelar
            </Button>
        </div>
    );
};
