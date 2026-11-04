import { GuestsManager } from "@/features/invites/components/instances/GuestsManager";
import { useSettingsSpace } from "../../../hooks/useSettingsSpace";

// The guests of the space: answer requests, revoke, archive.
export const GuestsSection = () => {
    const { spaceId, canInviteGuests, onInvite } = useSettingsSpace();

    return (
        <GuestsManager
            spaceId={spaceId}
            onAdd={canInviteGuests ? onInvite : undefined}
        />
    );
};
