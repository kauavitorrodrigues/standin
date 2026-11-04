import { usePermission } from "@/features/auth/hooks/usePermission";
import { SpaceSettingsQueries } from "@/features/spaces/settings/queries";
import { canGetGuestLink } from "../utils/guestInviteAccess";

/**
 * Whether the person gets the guest invite link of the space: the owner
 * always, a member when the space lets members invite. The owner already
 * knows, so only a member reads the setting.
 */
export const useCanInviteGuests = (spaceId: string): boolean => {
    const isOwner = usePermission("update", "space");
    const { settings } = SpaceSettingsQueries.useSpaceSettings(
        spaceId,
        !isOwner
    );

    return canGetGuestLink(isOwner, settings?.membersCanInvite);
};
