import { OAuthExchangeFailedError } from "@standin/contracts";
import { GITHUB_REQUEST_TIMEOUT_MS } from "../consts/http";

/**
 * One call to GitHub as JSON. A network error, a timeout, a status outside the
 * 2xx range, a redirect or a body that is not JSON is an
 * `OAuthExchangeFailedError`. The detail goes to the log only, never to the
 * person, and the credentials are never part of it.
 */
export const requestGithub = async (
    url: string,
    init: RequestInit
): Promise<unknown> => {
    try {
        const response = await fetch(url, {
            ...init,
            redirect: "error",
            signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) throw new Error(`GitHub answered ${response.status}`);

        return await response.json();
    } catch (cause) {
        console.error("[GitHub login] request failed:", url, cause);
        throw new OAuthExchangeFailedError();
    }
};
