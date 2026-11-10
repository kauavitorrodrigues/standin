import { db } from "@standin/database";
import { SpotifyProvider } from "@standin/infra";
import { SEAL_CONTEXTS, sealToken } from "../../../../../lib/crypto";
import { IntegrationService } from "../../../service";
import { SpotifyRepository } from "../repository";
import type { SaveSpotifyAppInput } from "../types";
import { isReplacedApp } from "./helpers/appChanges";

/**
 * Saves the Spotify app of the organization after Spotify accepts the pair
 * (`SpotifyCredentialsInvalidError` otherwise). A different client ID is a
 * different Spotify app, so the connections made with the old one are
 * deleted: their tokens would not work anymore.
 */
export const saveSpotifyApp = async ({
    organizationId,
    userId,
    clientId,
    clientSecret,
}: SaveSpotifyAppInput): Promise<void> => {
    await SpotifyProvider.verifyCredentials({ clientId, clientSecret });

    await db.transaction(async (tx) => {
        await IntegrationService.lock(tx, organizationId);

        const previous = await SpotifyRepository.findApp(organizationId, tx);
        await SpotifyRepository.upsertApp(tx, {
            organizationId,
            updatedById: userId,
            clientId,
            clientSecretSealed: sealToken(
                clientSecret,
                SEAL_CONTEXTS.INTEGRATION
            ),
        });

        if (isReplacedApp(previous, clientId)) {
            await SpotifyRepository.deleteConnections(tx, organizationId);
        }
    });
};
