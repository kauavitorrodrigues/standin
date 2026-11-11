import { SpotifyConnectionNotFoundError } from "@standin/contracts";
import { db } from "@standin/database";
import { IntegrationService } from "../../../service";
import { forgetAccessToken } from "./helpers/accessTokens";
import { SpotifyRepository } from "../repository";
import type { SpotifyConnectionKey } from "../types";

/**
 * Deletes the connection and its tokens, under the same lock as every other
 * write of the app. Spotify has no call to revoke them, the person also
 * removes the access in their Spotify account.
 */
export const disconnectSpotify = async (
    key: SpotifyConnectionKey
): Promise<void> => {
    await db.transaction(async (tx) => {
        await IntegrationService.lock(tx, key.organizationId);

        const wasConnected = await SpotifyRepository.deleteConnection(tx, key);
        if (!wasConnected) throw new SpotifyConnectionNotFoundError();
    });

    forgetAccessToken(key);
};
