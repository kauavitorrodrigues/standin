import { SpotifyNotConfiguredError } from "@standin/contracts";
import type { SpotifyCredentials } from "@standin/infra";
import type { OrganizationIntegrationRow } from "../../../../types";

/** Whether the saved app is another Spotify app than the one before. */
export const isReplacedApp = (
    previous: OrganizationIntegrationRow | null,
    clientId: string
): boolean => {
    if (!previous) return false;

    return previous.clientId !== clientId;
};

/**
 * The owner may have removed or replaced the app while the person was on
 * Spotify: a token of another app would be worth nothing. Throws a
 * `SpotifyNotConfiguredError` when the saved app is not the one used.
 */
export const assertSameApp = (
    current: OrganizationIntegrationRow | null,
    credentials: SpotifyCredentials
): void => {
    if (!current) throw new SpotifyNotConfiguredError();
    if (current.clientId !== credentials.clientId) {
        throw new SpotifyNotConfiguredError();
    }
};
