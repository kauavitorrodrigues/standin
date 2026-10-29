import type { HoverState } from "@/features/game/types/hover";
import type { Desk } from "../../types/desk";
import { resolveDeskStatus } from "../../utils/resolveDeskStatus";
import { resolveDeskView } from "../../utils/resolveDeskView";
import { DeskCard } from "../views/DeskCard";
import { OwnedDeskPill } from "./OwnedDeskPill";

type HoveredDeskCardProps = {
    hover: HoverState | null;
    desks: readonly Desk[];
    userId: string;
    names: ReadonlyMap<string, string>;
    onlineUserIds: readonly string[];
    isBusy: boolean;
    lockText: string | null;
    onClaim: (deskId: string, isMove: boolean) => void;
    onOpenProfile: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
};

// What the desk under the mouse shows: the button to claim or move to a free
// one, or the owner of one that has an owner.
export const HoveredDeskCard = ({
    hover,
    desks,
    userId,
    names,
    onlineUserIds,
    isBusy,
    lockText,
    onClaim,
    onOpenProfile,
    onPointerEnter,
    onPointerLeave,
}: HoveredDeskCardProps) => {
    if (!hover) return null;

    const view = resolveDeskView({
        status: resolveDeskStatus(desks, hover.id, userId),
        ownUserId: userId,
        hasOwnDesk: desks.some((desk) => desk.userId === userId),
    });

    switch (view.kind) {
        case "free":
            return (
                <DeskCard
                    hover={hover}
                    action={view.action}
                    isBusy={isBusy}
                    lockText={lockText}
                    onAction={() => onClaim(hover.id, view.action === "move")}
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                />
            );
        case "owned":
            return (
                <OwnedDeskPill
                    hover={hover}
                    ownerId={view.ownerId}
                    isSelf={view.isSelf}
                    names={names}
                    onlineUserIds={onlineUserIds}
                    onOpenProfile={onOpenProfile}
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                />
            );
    }
};
