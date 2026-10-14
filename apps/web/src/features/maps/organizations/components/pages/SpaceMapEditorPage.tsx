import { useNavigate } from "@tanstack/react-router";
import { MapEditorPage } from "@/features/maps/__shared__/components/pages/MapEditorPage";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SpacesQueries } from "@/features/spaces/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { useSpacePresence } from "../../hooks/useSpacePresence";

type SpaceMapEditorPageProps = {
    spaceId: string;
};

// The editor of the space map. There is no map photo to keep here, so the
// thumbnail target is left out. The user stays present in the space, with no
// avatar, movement, media or peer connection.
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

    useSpacePresence({ organizationId, spaceId, userId: user.id });

    if (!space) return null;

    return (
        <MapEditorPage
            mapId={space.map.id}
            title={space.name}
            onExit={() =>
                navigate({ to: "/spaces/$spaceId", params: { spaceId } })
            }
        />
    );
}
