import { useSocket } from "@/features/game/multiplayer/hooks/useSocket";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SpacesQueries } from "@/features/spaces/queries";
import {
    SPACE_AVAILABILITY_STATUS,
    SPACE_UNAVAILABLE_REASONS,
    type SpaceUnavailableReason,
} from "@/features/spaces/consts/availability";
import type { SpaceAvailability } from "@/features/spaces/types/availability";

const unavailable = (reason: SpaceUnavailableReason): SpaceAvailability => ({
    status: SPACE_AVAILABILITY_STATUS.UNAVAILABLE,
    reason,
});

// Loads the space and decides whether the page can run. A duplicate session
// wins over everything else, then loading, then a failed request.
export const useSpaceAvailability = (spaceId: string): SpaceAvailability => {
    const { isDuplicateSession } = useSocket();
    const organizationId = useOrganizationId();
    const { space, isLoading, isError } = SpacesQueries.useDetails(
        organizationId,
        spaceId
    );

    if (isDuplicateSession)
        return unavailable(SPACE_UNAVAILABLE_REASONS.DUPLICATE_SESSION);
    if (isLoading) return unavailable(SPACE_UNAVAILABLE_REASONS.LOADING);
    if (isError) return unavailable(SPACE_UNAVAILABLE_REASONS.ERROR);
    if (!space) return unavailable(SPACE_UNAVAILABLE_REASONS.NOT_FOUND);
    return { status: SPACE_AVAILABILITY_STATUS.READY, space };
};
