import { SPACE_VIEWER_KINDS } from "@standin/contracts";
import { SpaceUnavailable } from "@/features/spaces/components/pages/space-page/Unavailable";
import { SpacePage } from "@/features/spaces/components/pages/space-page/SpacePage";
import { SPACE_UNAVAILABLE_REASONS } from "@/features/spaces/consts/availability";
import { GuestQueries } from "../../queries";
import { GuestSpacePage } from "./GuestSpacePage";

// Opens a space for whoever may be in it: the organization's own page for a
// member, the guest's page for an admitted guest. The server decides which
// from the person and the space, so the page never trusts a URL for it.
export function SpaceEntry({ spaceId }: { spaceId: string }) {
    const { space, isLoading, isError } = GuestQueries.useSpaceView(spaceId);

    if (isLoading) {
        return <SpaceUnavailable reason={SPACE_UNAVAILABLE_REASONS.LOADING} />;
    }
    if (isError || !space) {
        return (
            <SpaceUnavailable reason={SPACE_UNAVAILABLE_REASONS.NOT_FOUND} />
        );
    }
    if (space.viewer.kind === SPACE_VIEWER_KINDS.GUEST) {
        return <GuestSpacePage space={space} />;
    }

    return <SpacePage spaceId={spaceId} />;
}
