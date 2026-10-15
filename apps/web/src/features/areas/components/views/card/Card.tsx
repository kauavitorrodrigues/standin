import { Link } from "@tanstack/react-router";
import type { AreaSummary } from "@standin/contracts";
import { formatAreaSize } from "../../../utils/formatAreaSize";
import { formatObjectCount } from "../../../utils/formatObjectCount";
import { formatUpdatedAt } from "../../../utils/formatUpdatedAt";
import { AreaActions } from "../../instances/AreaActions";
import { AreaThumbnail } from "./Thumbnail";

type Props = { area: AreaSummary };

// An area of the library: its picture, name, size, objects and the day it
// last changed. The whole card opens the composer, and the menu on the corner
// holds the other actions.
export const AreaCard = ({ area }: Props) => (
    <div className="hover:bg-muted/20 relative flex flex-col gap-3 overflow-hidden rounded-lg border p-3 transition-colors">
        <Link
            to="/admin/areas/$areaId/edit"
            params={{ areaId: area.id }}
            aria-label={`Editar ${area.name}`}
            className="absolute inset-0 z-0"
        />
        <div className="pointer-events-none">
            <AreaThumbnail area={area} />
        </div>
        <div className="flex items-start justify-between gap-2">
            <div className="pointer-events-none flex min-w-0 flex-col gap-1">
                <p className="truncate text-sm font-medium">{area.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                    {formatAreaSize(area.width, area.height)} ·{" "}
                    {formatObjectCount(area.objectCount)}
                </p>
                <p className="text-muted-foreground text-xs">
                    Alterada em {formatUpdatedAt(area.updatedAt)}
                </p>
            </div>
            <div className="relative z-10">
                <AreaActions area={area} />
            </div>
        </div>
    </div>
);
