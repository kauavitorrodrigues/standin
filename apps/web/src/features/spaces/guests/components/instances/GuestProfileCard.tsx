import { useEffect } from "react";
import { useHotkey } from "@/hooks/useHotkey";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import { PLAYER_EVENTS, PLAYER_HOVER_ID } from "@/features/game/consts/player";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import type { GameEngineHandle } from "@/features/game/types/game";
import { ProfileCard } from "@/features/users/components/instances/ProfileCard";
import { useProfileCard } from "@/features/users/hooks/useProfileCard";

type Props = { handle: GameEngineHandle | null };

// The profile card of a guest: a click on their own avatar opens it, with the
// Editar perfil button (picture, avatar and name). It has no desk and no
// decorator, which are the members'. A click anywhere else on the map, or Esc,
// closes it.
export const GuestProfileCard = ({ handle }: Props) => {
    const { user } = useAuth();
    const profileCard = useProfileCard();

    useHoverClick(handle, PLAYER_EVENTS.HOVER_CHANGED, (playerId) => {
        if (playerId !== null) profileCard.open();
    });
    useHoverClick(handle, DESK_EVENTS.HOVER_CHANGED, profileCard.close);
    useHotkey(["escape"], profileCard.close, { enabled: profileCard.isOpen });

    // The avatar stays outlined while its card is open, as a member's does.
    useEffect(() => {
        handle?.selectHover(
            PLAYER_EVENTS.HOVER_CHANGED,
            profileCard.isOpen ? PLAYER_HOVER_ID : null
        );
    }, [handle, profileCard.isOpen]);

    if (!profileCard.isOpen) return null;

    return (
        <ProfileCard
            user={user}
            isOnline
            onClose={profileCard.close}
            actions={null}
        />
    );
};
