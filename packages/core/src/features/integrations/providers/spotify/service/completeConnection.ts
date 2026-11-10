import { SpotifyConnectionLimitError } from "@standin/contracts";
import { db } from "@standin/database";
import { SpotifyProvider } from "@standin/infra";
import { SEAL_CONTEXTS, sealToken } from "../../../../../lib/crypto";
import { IntegrationService } from "../../../service";
import { SpotifyRepository } from "../repository";
import type { CompleteSpotifyConnectionInput } from "../types";
import { assertSameApp } from "./helpers/appChanges";
import { hasNoPlaceLeft } from "./helpers/places";
import { requireCredentials } from "./credentials";

/**
 * Finishes the connection after the callback: trades the code, asks Spotify
 * who the person is (an account that is not on the list of the app fails here
 * with `SpotifyAccountNotAllowedError`) and keeps the refresh token sealed.
 * The access token is thrown away, nothing needs it yet.
 */
export const completeSpotifyConnection = async ({
    organizationId,
    userId,
    redirectUri,
    code,
}: CompleteSpotifyConnectionInput): Promise<void> => {
    const credentials = await requireCredentials(organizationId);

    const tokens = await SpotifyProvider.exchangeCode({
        credentials,
        redirectUri,
        code,
    });

    const profile = await SpotifyProvider.getProfile(tokens.accessToken);

    await db.transaction(async (tx) => {
        await IntegrationService.lock(tx, organizationId);

        const current = await SpotifyRepository.findApp(organizationId, tx);
        assertSameApp(current, credentials);

        const key = { organizationId, userId };
        const existing = await SpotifyRepository.findConnection(key, tx);
        const total = await SpotifyRepository.countConnections(
            organizationId,
            tx
        );

        if (hasNoPlaceLeft(existing !== null, total)) {
            throw new SpotifyConnectionLimitError();
        }

        await SpotifyRepository.upsertConnection(tx, {
            ...key,
            accountId: profile.id,
            accountImageUrl: profile.imageUrl,
            refreshTokenSealed: sealToken(
                tokens.refreshToken,
                SEAL_CONTEXTS.INTEGRATION
            ),
            scope: tokens.scope,
        });
    });
};
