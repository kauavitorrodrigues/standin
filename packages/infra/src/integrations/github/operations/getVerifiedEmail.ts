import { OAuthExchangeFailedError } from "@standin/contracts";
import { GITHUB_USER_EMAILS_URL } from "../consts";
import { buildApiHeaders } from "../utils/buildApiHeaders";
import { EmailListSchema } from "../schemas";
import { requestGithub } from "../utils/requestGithub";

/**
 * The primary e-mail of the account, only when GitHub verified it. Returns
 * null otherwise. An e-mail that is not verified is never used to find or link
 * a person.
 */
export const getVerifiedEmail = async (
    accessToken: string
): Promise<string | null> => {
    const body = await requestGithub(GITHUB_USER_EMAILS_URL, {
        method: "GET",
        headers: buildApiHeaders(accessToken),
    });

    const parsed = EmailListSchema.safeParse(body);
    if (!parsed.success) throw new OAuthExchangeFailedError();

    const primary = parsed.data.find(
        ({ primary, verified }) => primary && verified
    );

    return primary?.email ?? null;
};
