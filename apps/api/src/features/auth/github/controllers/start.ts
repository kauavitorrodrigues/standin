import type { RequestHandler } from "express";
import { OAuthProviderDisabledError } from "@standin/contracts";
import { GithubProvider } from "@standin/infra";
import { sendError } from "@/utils/sendError";
import {
    createOAuthStateSecrets,
    writeOAuthStateCookie,
} from "../utils/oauthStateCookie";

export const start: RequestHandler = (_req, res) => {
    if (!GithubProvider.isConfigured()) {
        return sendError({
            res,
            reportError: new OAuthProviderDisabledError(),
        });
    }

    const secrets = createOAuthStateSecrets();
    writeOAuthStateCookie(res, secrets);

    res.redirect(GithubProvider.getAuthUrl(secrets));
};
