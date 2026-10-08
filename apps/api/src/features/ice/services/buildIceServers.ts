import { createHmac } from "node:crypto";
import type { IceServer } from "@standin/contracts";

export type IceServersConfig = {
    host: string;
    secret: string;
    ttlSeconds: number;
    port: number;
};

export const DEFAULT_TURN_PORT = 3478;
export const DEFAULT_TURN_TTL_SECONDS = 3600;

// Ephemeral credentials for a coturn instance running with
// `use-auth-secret` (the TURN REST API scheme). Nothing is stored: the
// username carries its own expiry, and the password is an HMAC of that
// username under the secret shared with coturn, which recomputes and checks
// it on its own. A leaked credential stops working when its TTL runs out,
// and there is no fixed username/password to abuse.
export const buildTurnCredentials = (
    userId: string,
    secret: string,
    ttlSeconds: number,
    nowMs: number
): { username: string; credential: string } => {
    const expiresAt = Math.floor(nowMs / 1000) + ttlSeconds;
    const username = `${expiresAt}:${userId}`;
    const credential = createHmac("sha1", secret)
        .update(username)
        .digest("base64");

    return { username, credential };
};

export const buildIceServers = (
    userId: string,
    config: IceServersConfig | null,
    nowMs: number
): IceServer[] => {
    // No TURN configured: hand back no servers at all. Direct (host)
    // candidates still connect peers on the same network, which is enough
    // for local development, and the operator is not silently pointed at a
    // third-party relay.
    if (!config) return [];

    const { username, credential } = buildTurnCredentials(
        userId,
        config.secret,
        config.ttlSeconds,
        nowMs
    );
    const hostPort = `${config.host}:${config.port}`;

    return [
        { urls: `stun:${hostPort}` },
        {
            urls: [
                `turn:${hostPort}?transport=udp`,
                `turn:${hostPort}?transport=tcp`,
            ],
            username,
            credential,
        },
    ];
};

// Reads the three env vars as a group: TURN is either fully configured or
// treated as not configured, never half-applied.
export const readIceServersConfig = (
    env: NodeJS.ProcessEnv
): IceServersConfig | null => {
    const host = env.TURN_HOST;
    const secret = env.TURN_SECRET;
    if (!host || !secret) return null;

    const ttlSeconds = Number(env.TURN_TTL_SECONDS);
    const port = Number(env.TURN_PORT);

    return {
        host,
        secret,
        ttlSeconds:
            Number.isFinite(ttlSeconds) && ttlSeconds > 0
                ? ttlSeconds
                : DEFAULT_TURN_TTL_SECONDS,
        port: Number.isFinite(port) && port > 0 ? port : DEFAULT_TURN_PORT,
    };
};
