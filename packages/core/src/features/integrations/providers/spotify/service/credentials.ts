import { SpotifyNotConfiguredError } from "@standin/contracts";
import type { SpotifyCredentials } from "@standin/infra";
import { SEAL_CONTEXTS, openToken } from "../../../../../lib/crypto";
import { SpotifyRepository } from "../repository";

/**
 * The app of the organization with its secret open, or null when it has no
 * app or the secret cannot be opened (the server secret changed), in which
 * case the owner saves the pair again.
 */
export const findCredentials = async (
    organizationId: string
): Promise<SpotifyCredentials | null> => {
    const app = await SpotifyRepository.findApp(organizationId);
    if (!app) return null;

    const clientSecret = openToken(
        app.clientSecretSealed,
        SEAL_CONTEXTS.INTEGRATION
    );
    if (!clientSecret) return null;

    return { clientId: app.clientId, clientSecret };
};

/** The same, or a `SpotifyNotConfiguredError` for what needs an app. */
export const requireCredentials = async (
    organizationId: string
): Promise<SpotifyCredentials> => {
    const credentials = await findCredentials(organizationId);
    if (!credentials) throw new SpotifyNotConfiguredError();

    return credentials;
};
