import { GuestsManager } from "@/features/invites/components/instances/GuestsManager";
import { useSettingsSpace } from "../../../hooks/useSettingsSpace";

// The guests of the space: answer requests, revoke, archive.
export const GuestsSection = () => {
    const { spaceId, canInvite, onInvite } = useSettingsSpace();

    return (
        <GuestsManager
            spaceId={spaceId}
            onAdd={canInvite ? onInvite : undefined}
        />
    );
};
