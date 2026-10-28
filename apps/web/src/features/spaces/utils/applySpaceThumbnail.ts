import type { QueryClient } from "@tanstack/react-query";
import type { Space, SpaceDetails } from "@standin/contracts";
import { ORGANIZATION_SPACES_QUERY_KEY } from "../queries/useByOrganization";
import { SPACE_DETAILS_QUERY_KEY } from "../queries/useDetails";

// Puts the new photo in what is already on screen, the card of the list and the
// detail of that one space, straight from the answer of the upload. Nothing is
// refetched, so the editor that saved the photo keeps the map it is working on.
export const applySpaceThumbnail = (
    queryClient: QueryClient,
    organizationId: string,
    { id, thumbnailUrl }: Space
): void => {
    queryClient.setQueryData<Space[]>(
        [ORGANIZATION_SPACES_QUERY_KEY, organizationId],
        (spaces) =>
            spaces?.map((space) =>
                space.id === id ? { ...space, thumbnailUrl } : space
            )
    );
    queryClient.setQueryData<SpaceDetails>(
        [SPACE_DETAILS_QUERY_KEY, organizationId, id],
        (details) => details && { ...details, thumbnailUrl }
    );
};
