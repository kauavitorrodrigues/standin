import { SpotifyConnectionLimitError } from "@standin/contracts";
import { SpotifyProvider } from "@standin/infra";
import { SpotifyRepository } from "../repository";
import type { StartSpotifyConnectionInput } from "../types";
import { hasNoPlaceLeft } from "./helpers/places";
import { requireCredentials } from "./credentials";

/**
 * The Spotify page where the person allows the app of their organization.
 * Fails early when there is no app or no place left for them, so they do not
 * authorize for nothing. The place is checked again when they come back.
 */
export const startSpotifyConnection = async ({
    organizationId,
    userId,
    redirectUri,
    state,
}: StartSpotifyConnectionInput): Promise<string> => {
    const credentials = await requireCredentials(organizationId);

    const [connection, total] = await Promise.all([
        SpotifyRepository.findConnection({ organizationId, userId }),
        SpotifyRepository.countConnections(organizationId),
    ]);
    if (hasNoPlaceLeft(connection !== null, total)) {
        throw new SpotifyConnectionLimitError();
    }

    return SpotifyProvider.getAuthUrl({ credentials, redirectUri, state });
};
