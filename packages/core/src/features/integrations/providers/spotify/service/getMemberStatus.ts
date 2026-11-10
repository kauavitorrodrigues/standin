import type { SpotifyMemberStatus } from "@standin/contracts";
import { SpotifyRepository } from "../repository";
import type { SpotifyConnectionKey } from "../types";
import { hasNoPlaceLeft } from "./helpers/places";
import { findCredentials } from "./credentials";

/** What a member sees: is there an app, are they connected, is it full. */
export const getSpotifyMemberStatus = async (
    key: SpotifyConnectionKey
): Promise<SpotifyMemberStatus> => {
    const credentials = await findCredentials(key.organizationId);

    if (!credentials) {
        return { isAvailable: false, isConnected: false, isFull: false };
    }

    const [connection, total] = await Promise.all([
        SpotifyRepository.findConnection(key),
        SpotifyRepository.countConnections(key.organizationId),
    ]);

    const isConnected = connection !== null;

    return {
        isAvailable: true,
        isConnected,
        isFull: hasNoPlaceLeft(isConnected, total),
    };
};
