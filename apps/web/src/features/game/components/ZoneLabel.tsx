import { useHoverTarget } from "@/features/game/hooks/useHoverTarget";
import { ZONE_EVENTS } from "@/features/game/consts/zone";
import type { GameEngineHandle } from "@/features/game/types/game";

type ZoneLabelProps = {
    handle: GameEngineHandle | null;
};

// The name of the zone under the mouse, like a tooltip under the bottom edge
// of its outline at the right corner, where the card of a desk hangs too.
export const ZoneLabel = ({ handle }: ZoneLabelProps) => {
    const { hover } = useHoverTarget(handle, ZONE_EVENTS.HOVER_CHANGED);
    if (!hover?.label) return null;

    const { screen, label } = hover;
    return (
        <div
            className="pointer-events-none absolute z-20 -translate-x-full pt-1"
            style={{ left: screen.x + screen.width, top: screen.y + screen.height }}
        >
            <div className="rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background shadow-lg">
                {label}
            </div>
        </div>
    );
};
