import type { SpotifyCredentials } from "../types";

/** The `Authorization` header the token endpoint asks for. */
export const buildBasicAuth = ({
    clientId,
    clientSecret,
}: SpotifyCredentials): string =>
    `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
