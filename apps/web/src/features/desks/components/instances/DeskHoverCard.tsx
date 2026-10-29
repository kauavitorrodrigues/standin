import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useHotkey } from "@/hooks/useHotkey";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import { useHoverTarget } from "@/features/game/hooks/useHoverTarget";
import { useSelectedTarget } from "@/features/game/hooks/useSelectedTarget";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import { PLAYER_EVENTS, PLAYER_HOVER_ID } from "@/features/game/consts/player";
import type { GameEngineHandle } from "@/features/game/types/game";
import { useDeskActions } from "../../hooks/useDeskActions";
import { useSpaceDesks } from "../../queries/useSpaceDesks";
import { DESK_MESSAGES } from "../../consts/messages";
import { resolveDeskLockText } from "../../utils/resolveDeskLockText";
import { resolveDeskStatus } from "../../utils/resolveDeskStatus";
import type { AssignTarget } from "../../hooks/useAssignPick";
import { MoveDeskDialog } from "../dialogs/MoveDeskDialog";
import { LockedDeskMark } from "../views/LockedDeskMark";
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
    // Who holds the map in the Studio, told on the card of a free desk.
    lockHolderName?: string;
    // Who the owner of the organization is giving a desk to: the next click on
    // a free desk gives it to them.
    assignTarget: AssignTarget | null;
    onAssignDone: () => void;
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
    lockHolderName,
    assignTarget,
    onAssignDone,
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
    const { claimDesk, assignDesk, isPending } = useDeskActions(spaceId);

    // A move asks first; the dialog outlives the hover card, since the mouse
    // leaves the desk when it opens.
    const [moveDeskId, setMoveDeskId] = useState<string | null>(null);

    const ownDeskId =
        desks.find((desk) => desk.userId === userId)?.mapAssetId ?? null;
    useEffect(() => {
        handle?.selectHover(
            DESK_EVENTS.HOVER_CHANGED,
            isProfileOpen ? ownDeskId : null
        );
    }, [handle, isProfileOpen, ownDeskId]);

    const giveDesk = async (deskId: string, target: AssignTarget) => {
        if (resolveDeskStatus(desks, deskId, userId).kind !== "free") {
            toast.add({ title: DESK_MESSAGES.PICK_TAKEN, type: "error" });
            return;
        }

        const isAssigned = await assignDesk(deskId, target.id);
        if (isAssigned) onAssignDone();
    };

    // A click inside the outline of the desk of the person selects it by
    // opening their card. A click anywhere else on the map, or Esc, drops it.
    useHoverClick(handle, DESK_EVENTS.HOVER_CHANGED, (deskId) => {
        // Giving a desk: only a free desk answers, anything else is ignored.
        if (assignTarget) {
            if (deskId !== null) void giveDesk(deskId, assignTarget);
            return;
        }

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
    useHotkey(["escape"], onAssignDone, { enabled: assignTarget !== null });

    // The selected desk already shows its owner, so the hover adds nothing.
    // While a desk is being given the card has nothing to offer.
    const hoverOutsideSelection =
        assignTarget || hover?.id === selected?.id ? null : hover;

    const handleClaim = (deskId: string, isMove: boolean) => {
        if (isMove) return setMoveDeskId(deskId);

        void claimDesk(deskId, false);
    };

    const confirmMove = async () => {
        if (moveDeskId === null) return;

        await claimDesk(moveDeskId, true);
        setMoveDeskId(null);
    };

    // While a desk is being given, one that has an owner shows a lock with
    // the name, since it cannot be chosen.
    const lockedHover =
        assignTarget &&
        hover &&
        resolveDeskStatus(desks, hover.id, userId).kind !== "free"
            ? hover
            : null;
    const lockedOwnerId = lockedHover
        ? (desks.find((desk) => desk.mapAssetId === lockedHover.id)?.userId ??
          null)
        : null;

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
                lockText={resolveDeskLockText(isMapLocked, lockHolderName)}
                onClaim={handleClaim}
                onOpenProfile={onOpenProfile}
                onPointerEnter={enterCard}
                onPointerLeave={leaveCard}
            />
            {lockedHover && (
                <LockedDeskMark
                    hover={lockedHover}
                    text={DESK_MESSAGES.deskOf(
                        (lockedOwnerId && names.get(lockedOwnerId)) ||
                            DESK_MESSAGES.OWNER_FALLBACK
                    )}
                />
            )}
            <MoveDeskDialog
                open={moveDeskId !== null}
                isBusy={isPending || isMapLocked}
                onConfirm={confirmMove}
                onCancel={() => setMoveDeskId(null)}
            />
        </>
    );
};
