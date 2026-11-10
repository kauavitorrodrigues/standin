import { db } from "@standin/database";
import { IntegrationService } from "../../../service";
import { SpotifyRepository } from "../repository";

/** Removes the Spotify app of the organization and every connection made with it. */
export const removeSpotifyApp = async (
    organizationId: string
): Promise<void> => {
    await db.transaction(async (tx) => {
        await IntegrationService.lock(tx, organizationId);
        await SpotifyRepository.deleteConnections(tx, organizationId);
        await SpotifyRepository.deleteApp(tx, organizationId);
    });
};
