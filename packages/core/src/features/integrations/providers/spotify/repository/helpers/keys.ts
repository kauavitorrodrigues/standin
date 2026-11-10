import type {
    AppConnectionKey,
    ConnectionTarget,
    OrganizationIntegrationKey,
} from "../../../../types";
import { SPOTIFY_PROVIDER, SPOTIFY_SERVICE } from "../../consts";
import type { SpotifyConnectionKey } from "../../types";

/** The Spotify app of an organization. */
export const toIntegrationKey = (
    organizationId: string
): OrganizationIntegrationKey => ({
    organizationId,
    provider: SPOTIFY_PROVIDER,
});

/** The Spotify connections of an organization. */
export const toTarget = (organizationId: string): ConnectionTarget => ({
    ...toIntegrationKey(organizationId),
    service: SPOTIFY_SERVICE,
});

/** The Spotify connection of one person. */
export const toConnectionKey = ({
    organizationId,
    userId,
}: SpotifyConnectionKey): AppConnectionKey => ({
    ...toTarget(organizationId),
    userId,
});
