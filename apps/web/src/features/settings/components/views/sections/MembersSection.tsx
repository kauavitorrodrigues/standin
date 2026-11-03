import { MembersManager } from "@/features/invites/components/instances/MembersManager";
import { useSettingsSpace } from "../../../hooks/useSettingsSpace";

// The people of the organization and the invitations still waiting.
export const MembersSection = () => {
    const { organizationId, onInvite } = useSettingsSpace();

    return <MembersManager organizationId={organizationId} onAdd={onInvite} />;
};
