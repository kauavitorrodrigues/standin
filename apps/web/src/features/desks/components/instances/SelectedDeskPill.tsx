import type { HoverState } from "@/features/game/types/hover";
import { useProfilePictureOf } from "@/features/users/hooks/useProfilePictureOf";
import { DESK_MESSAGES } from "../../consts/messages";
import { DeskOwnerPill } from "../views/DeskOwnerPill";

type SelectedDeskPillProps = {
    // Where the selected desk is on the canvas, null with none selected.
    selected: HoverState | null;
    ownerId: string;
    names: ReadonlyMap<string, string>;
    onlineUserIds: readonly string[];
    onOpenProfile: () => void;
};

// The owner of the selected desk, over it and shown all the time, with no
// wait. It is the
// desk of the person, so the pill opens their profile.
export const SelectedDeskPill = ({
    selected,
    ownerId,
    names,
    onlineUserIds,
    onOpenProfile,
}: SelectedDeskPillProps) => {
    const ownerPicture = useProfilePictureOf(ownerId);

    if (!selected) return null;

    return (
        <DeskOwnerPill
            hover={selected}
            owner={{
                id: ownerId,
                name: names.get(ownerId) ?? DESK_MESSAGES.OWNER_FALLBACK,
                avatar: ownerPicture,
            }}
            isOnline={onlineUserIds.includes(ownerId)}
            placement="above"
            onSelect={onOpenProfile}
            onPointerEnter={() => {}}
            onPointerLeave={() => {}}
        />
    );
};
