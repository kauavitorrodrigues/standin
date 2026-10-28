import { useNavigate } from "@tanstack/react-router";
import { MapEditorPage } from "@/features/maps/__shared__/components/pages/MapEditorPage";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SpacesQueries } from "@/features/spaces/queries";
import { SpaceMutations } from "@/features/spaces/mutations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { useSpacePresence } from "../../hooks/useSpacePresence";

type SpaceMapEditorPageProps = {
    spaceId: string;
};

// The editor of the space map. The photo on the card of the space is kept
// here: made when the space has none, and again after each publish. The user
// stays present in the space, with no avatar, movement, media or peer
// connection.
export function SpaceMapEditorPage({ spaceId }: SpaceMapEditorPageProps) {
    return (
        <SocketProvider>
            <SpaceMapEditorContent spaceId={spaceId} />
        </SocketProvider>
    );
}

function SpaceMapEditorContent({ spaceId }: SpaceMapEditorPageProps) {
    const navigate = useNavigate();
    const organizationId = useOrganizationId();
    const { user } = useAuth();
    const { space } = SpacesQueries.useDetails(organizationId, spaceId);
    const { mutateAsync: setThumbnail } = SpaceMutations.setThumbnail();

    useSpacePresence({ organizationId, spaceId, userId: user.id });

    if (!space) return null;

    return (
        <MapEditorPage
            mapId={space.map.id}
            title={space.name}
            onExit={() =>
                navigate({ to: "/spaces/$spaceId", params: { spaceId } })
            }
            thumbnail={{
                missing: !space.thumbnailUrl,
                save: (thumbnail) => setThumbnail({ spaceId, thumbnail }),
            }}
        />
    );
}
