import { useDwell } from "@/hooks/useDwell";
import type { HoverState } from "@/features/game/types/hover";
import { DESK_OWNER_PILL_DWELL_MS } from "../../consts/hover";
import { DESK_MESSAGES } from "../../consts/messages";
import { DeskOwnerPill } from "../views/DeskOwnerPill";

type OwnedDeskPillProps = {
    hover: HoverState;
    ownerId: string;
    isSelf: boolean;
    names: ReadonlyMap<string, string>;
    onlineUserIds: readonly string[];
    onOpenProfile: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
};

// The owner of the desk under the mouse, shown once the mouse has rested on
// it for a moment.
export const OwnedDeskPill = ({
    hover,
    ownerId,
    isSelf,
    names,
    onlineUserIds,
    onOpenProfile,
    onPointerEnter,
    onPointerLeave,
}: OwnedDeskPillProps) => {
    const hasRested = useDwell(hover.id, DESK_OWNER_PILL_DWELL_MS);
    if (!hasRested) return null;

    return (
        <DeskOwnerPill
            hover={hover}
            owner={{
                id: ownerId,
                name: names.get(ownerId) ?? DESK_MESSAGES.OWNER_FALLBACK,
            }}
            isOnline={onlineUserIds.includes(ownerId)}
            placement="below"
            onSelect={isSelf ? onOpenProfile : undefined}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        />
    );
};
