import { OAuthExchangeFailedError } from "@standin/contracts";
import { GITHUB_USER_URL } from "../consts";
import { buildApiHeaders } from "../utils/buildApiHeaders";
import type { GithubProfile } from "../types";
import { UserProfileSchema } from "../schemas";
import { requestGithub } from "../utils/requestGithub";

/**
 * Reads the account of the token. The `email` of this endpoint is ignored on
 * purpose, it can be empty or not verified (see `getVerifiedEmail`).
 */
export const getProfile = async (
    accessToken: string
): Promise<GithubProfile> => {
    const body = await requestGithub(GITHUB_USER_URL, {
        method: "GET",
        headers: buildApiHeaders(accessToken),
    });

    const parsed = UserProfileSchema.safeParse(body);
    if (!parsed.success) throw new OAuthExchangeFailedError();

    const { id, login, name, avatar_url } = parsed.data;

    return {
        id: String(id),
        login,
        name: name ?? null,
        avatarUrl: avatar_url ?? null,
    };
};
