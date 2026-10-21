import { GITHUB_AUTHORIZE_URL, GITHUB_CODE_CHALLENGE_METHOD } from "../consts";
import { buildCodeChallenge } from "../utils/pkce";
import { requireConfig } from "../utils/requireConfig";

type GetAuthUrlInput = {
    state: string;
    verifier: string;
};

/**
 * The GitHub page where the person authorizes the app. Throws
 * `OAuthProviderDisabledError` when the login is not configured.
 */
export const getAuthUrl = ({ state, verifier }: GetAuthUrlInput): string => {
    const config = requireConfig();

    const url = new URL(GITHUB_AUTHORIZE_URL);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.callbackUrl);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", buildCodeChallenge(verifier));
    url.searchParams.set("code_challenge_method", GITHUB_CODE_CHALLENGE_METHOD);

    return url.toString();
};
