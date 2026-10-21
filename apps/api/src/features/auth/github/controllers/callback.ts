import type { RequestHandler } from "express";
import {
    OAuthAccessDeniedError,
    OAuthExchangeFailedError,
    OAuthProviderDisabledError,
} from "@standin/contracts";
import { GithubProvider } from "@standin/infra";
import { sendError } from "@/utils/sendError";
import { createToken } from "../../services/createToken";
import { setTokenCookie } from "../../utils/setTokenCookie";
import { resolveUser } from "../services/resolveUser";
import { buildWebRedirectUrl } from "../utils/buildWebRedirectUrl";
import { importGithubProfilePicture } from "../utils/importGithubProfilePicture";
import { consumeOAuthStateCookie } from "../utils/oauthStateCookie";
import { resolveOAuthErrorCode } from "../utils/resolveOAuthErrorCode";

const readQueryString = (value: unknown): string | null =>
    typeof value === "string" && value.length > 0 ? value : null;

export const callback: RequestHandler = async (req, res) => {
    if (!GithubProvider.isConfigured()) {
        return sendError({
            res,
            reportError: new OAuthProviderDisabledError(),
        });
    }

    try {
        const verifier = consumeOAuthStateCookie(req, res, req.query.state);

        if (readQueryString(req.query.error) !== null) {
            throw new OAuthAccessDeniedError();
        }
        const code = readQueryString(req.query.code);
        if (!code) throw new OAuthExchangeFailedError();

        const accessToken = await GithubProvider.exchangeCode({
            code,
            verifier,
        });
        const profile = await GithubProvider.getProfile(accessToken);
        const { user, outcome } = await resolveUser({ accessToken, profile });

        // A new person always gets the photo. A person who just linked gets it
        // only when they have none. A person who was already linked keeps theirs.
        const needsPhoto =
            outcome === "created" ||
            (outcome === "linked" && user.profilePictureUrl === null);
        if (needsPhoto)
            await importGithubProfilePicture(user.id, profile.avatarUrl);

        setTokenCookie(res, createToken(user));
        res.redirect(buildWebRedirectUrl());
    } catch (error) {
        console.error("[GitHub login] sign in failed:", error);
        res.redirect(buildWebRedirectUrl(resolveOAuthErrorCode(error)));
    }
};
