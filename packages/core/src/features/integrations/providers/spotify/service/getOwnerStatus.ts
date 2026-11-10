import {
    SPOTIFY_MAX_CONNECTIONS,
    type SpotifyOwnerStatus,
} from "@standin/contracts";
import { SpotifyRepository } from "../repository";
import { findCredentials } from "./credentials";

/**
 * What the owner sees in the card. An app whose secret cannot be opened counts
 * as not set, so the owner is asked for the pair again.
 */
export const getSpotifyOwnerStatus = async (
    organizationId: string,
    redirectUri: string
): Promise<SpotifyOwnerStatus> => {
    const credentials = await findCredentials(organizationId);
    if (!credentials) {
        return {
            isConfigured: false,
            clientId: null,
            redirectUri,
            maxConnections: SPOTIFY_MAX_CONNECTIONS,
            connections: [],
        };
    }

    return {
        isConfigured: true,
        clientId: credentials.clientId,
        redirectUri,
        maxConnections: SPOTIFY_MAX_CONNECTIONS,
        connections: await SpotifyRepository.listConnections(organizationId),
    };
};
