import { db } from "@standin/database";
import { IntegrationService } from "../../../../service";
import { SpotifyRepository } from "../../repository";
import type { SpotifyConnectionKey } from "../../types";
import { forgetAccessToken } from "./accessTokens";

// The person took the access back: the connection is of no use, so it goes.
export const dropRevokedConnection = async (
    key: SpotifyConnectionKey
): Promise<void> => {
    forgetAccessToken(key);
    await db.transaction(async (tx) => {
        await IntegrationService.lock(tx, key.organizationId);
        await SpotifyRepository.deleteConnection(tx, key);
    });
};
