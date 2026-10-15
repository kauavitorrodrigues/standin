import { Loader2Icon } from "lucide-react";
import { StatusPill } from "@/features/maps/__shared__/components/views/status/StatusPill";
import { AREA_STATUS_KIND } from "../../consts/areaStatus";
import type { AreaStatus } from "../../types/areaStatus";

type Props = { status: AreaStatus };

// Says where the composer stands: clean, with unsaved changes or saving.
export const AreaStatusBadge = ({ status }: Props) => {
    switch (status) {
        case AREA_STATUS_KIND.CLEAN:
            return (
                <StatusPill className="bg-muted text-muted-foreground">
                    Sem alterações
                </StatusPill>
            );
        case AREA_STATUS_KIND.DRAFT:
            return (
                <StatusPill className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    Alterações não salvas
                </StatusPill>
            );
        case AREA_STATUS_KIND.SAVING:
            return (
                <StatusPill className="bg-muted text-foreground">
                    <Loader2Icon className="size-3 animate-spin" />
                    Salvando...
                </StatusPill>
            );
    }
};
