import { OAuthExchangeFailedError } from "@standin/contracts";
import { GITHUB_TOKEN_URL } from "../consts";
import { TokenResponseSchema } from "../schemas";
import { requestGithub } from "../utils/requestGithub";
import { requireConfig } from "../utils/requireConfig";

type ExchangeCodeInput = {
    code: string;
    verifier: string;
};

/** Trades the code of the callback for a user access token. */
export const exchangeCode = async ({
    code,
    verifier,
}: ExchangeCodeInput): Promise<string> => {
    const config = requireConfig();

    const body = await requestGithub(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: config.callbackUrl,
            code_verifier: verifier,
        }),
    });

    const parsed = TokenResponseSchema.safeParse(body);
    if (!parsed.success) throw new OAuthExchangeFailedError();

    return parsed.data.access_token;
};
