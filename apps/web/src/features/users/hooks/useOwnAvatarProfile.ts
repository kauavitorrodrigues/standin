import { useEffect } from "react";
import {
    AVATAR_EVENTS,
    OWN_AVATAR_TARGET_ID,
} from "@/features/game/consts/avatar-hover";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import type { GameEngineHandle } from "@/features/game/types/game";

// A click on the avatar of the person opens their profile card, and the avatar
// stays highlighted while the card is open. A click elsewhere on the map
// closes the card, which the desk hover already handles.
export const useOwnAvatarProfile = (
    handle: GameEngineHandle | null,
    isProfileOpen: boolean,
    onOpenProfile: () => void
) => {
    useHoverClick(handle, AVATAR_EVENTS.HOVER_CHANGED, (id) => {
        if (id === OWN_AVATAR_TARGET_ID) onOpenProfile();
    });

    useEffect(() => {
        handle?.selectHover(
            AVATAR_EVENTS.HOVER_CHANGED,
            isProfileOpen ? OWN_AVATAR_TARGET_ID : null
        );
    }, [handle, isProfileOpen]);
};
