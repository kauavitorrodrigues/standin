import { OAuthProviderDisabledError } from "@standin/contracts";
import type { GithubConfig } from "../types";
import { getConfig } from "./getConfig";

/** The config, or an `OAuthProviderDisabledError` when the login is off. */
export const requireConfig = (): GithubConfig => {
    const config = getConfig();
    if (!config) throw new OAuthProviderDisabledError();

    return config;
};
