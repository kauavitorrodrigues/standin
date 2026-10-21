import {
    GITHUB_CALLBACK_URL_ENV_VAR,
    GITHUB_CLIENT_ID_ENV_VAR,
    GITHUB_CLIENT_SECRET_ENV_VAR,
} from "../consts/env";
import type { GithubConfig } from "../types";

const readEnv = (name: string): string => process.env[name]?.trim() ?? "";

/**
 * The only source of the decision "login with GitHub is on". It is on when
 * the client id, the client secret and the callback URL are all set. It is read
 * at call time, so nothing is cached.
 */
export const getConfig = (): GithubConfig | null => {
    const clientId = readEnv(GITHUB_CLIENT_ID_ENV_VAR);
    const clientSecret = readEnv(GITHUB_CLIENT_SECRET_ENV_VAR);
    const callbackUrl = readEnv(GITHUB_CALLBACK_URL_ENV_VAR);

    if (!clientId || !clientSecret || !callbackUrl) return null;

    return { clientId, clientSecret, callbackUrl };
};

export const isConfigured = (): boolean => getConfig() !== null;
