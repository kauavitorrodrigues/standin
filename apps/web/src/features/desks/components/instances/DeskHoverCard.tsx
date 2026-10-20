import { useEffect } from "react";
import { useHotkey } from "@/hooks/useHotkey";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import { useHoverTarget } from "@/features/game/hooks/useHoverTarget";
import { useSelectedTarget } from "@/features/game/hooks/useSelectedTarget";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import { PLAYER_EVENTS, PLAYER_HOVER_ID } from "@/features/game/consts/player";
import type { GameEngineHandle } from "@/features/game/types/game";
import { useDeskActions } from "../../hooks/useDeskActions";
import { useSpaceDesks } from "../../queries/useSpaceDesks";
import { resolveDeskStatus } from "../../utils/resolveDeskStatus";
import { HoveredDeskCard } from "./HoveredDeskCard";
import { SelectedDeskPill } from "./SelectedDeskPill";

type DeskHoverCardProps = {
    handle: GameEngineHandle | null;
    spaceId: string;
    userId: string;
    names: ReadonlyMap<string, string>;
    onlineUserIds: readonly string[];
    // A map being edited refuses desk changes, so the button turns off.
    isMapLocked: boolean;
    // The card of the person is open, which selects their desk: it stays
    // outlined and shows its owner all the time.
    isProfileOpen: boolean;
    onOpenProfile: () => void;
    onCloseProfile: () => void;
};

// The floating cards of the desks: the one of the desk under the mouse and
// the one of the selected desk.
export const DeskHoverCard = ({
    handle,
    spaceId,
    userId,
    names,
    onlineUserIds,
    isMapLocked,
    isProfileOpen,
    onOpenProfile,
    onCloseProfile,
}: DeskHoverCardProps) => {
    const { hover, enterCard, leaveCard } = useHoverTarget(
        handle,
        DESK_EVENTS.HOVER_CHANGED
    );
    const selected = useSelectedTarget(handle, DESK_EVENTS.HOVER_CHANGED);
    const { desks } = useSpaceDesks(spaceId);
    const { claimDesk, isPending } = useDeskActions(spaceId);

    const ownDeskId =
        desks.find((desk) => desk.userId === userId)?.mapAssetId ?? null;
    useEffect(() => {
        handle?.selectHover(
            DESK_EVENTS.HOVER_CHANGED,
            isProfileOpen ? ownDeskId : null
        );
    }, [handle, isProfileOpen, ownDeskId]);

    // A click inside the outline of the desk of the person selects it by
    // opening their card. A click anywhere else on the map, or Esc, drops it.
    useHoverClick(handle, DESK_EVENTS.HOVER_CHANGED, (deskId) => {
        const isOwnDesk =
            deskId !== null &&
            resolveDeskStatus(desks, deskId, userId).kind === "mine";
        if (isOwnDesk) return onOpenProfile();

        onCloseProfile();
    });
    useEffect(() => {
        handle?.selectHover(
            PLAYER_EVENTS.HOVER_CHANGED,
            isProfileOpen ? PLAYER_HOVER_ID : null
        );
    }, [handle, isProfileOpen]);

    // A click on the avatar of the person opens their card too.
    useHoverClick(handle, PLAYER_EVENTS.HOVER_CHANGED, (playerId) => {
        if (playerId !== null) onOpenProfile();
    });
    useHotkey(["escape"], onCloseProfile, { enabled: isProfileOpen });

    // The selected desk already shows its owner, so the hover adds nothing.
    const hoverOutsideSelection = hover?.id === selected?.id ? null : hover;

    return (
        <>
            <SelectedDeskPill
                selected={selected}
                ownerId={userId}
                names={names}
                onlineUserIds={onlineUserIds}
                onOpenProfile={onOpenProfile}
            />
            <HoveredDeskCard
                hover={hoverOutsideSelection}
                desks={desks}
                userId={userId}
                names={names}
                onlineUserIds={onlineUserIds}
                isBusy={isPending || isMapLocked}
                onClaim={claimDesk}
                onOpenProfile={onOpenProfile}
                onPointerEnter={enterCard}
                onPointerLeave={leaveCard}
            />
        </>
    );
};
