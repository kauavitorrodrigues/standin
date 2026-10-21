import { downloadAvatar } from "./operations/downloadAvatar";
import { exchangeCode } from "./operations/exchangeCode";
import { getAuthUrl } from "./operations/getAuthUrl";
import { getProfile } from "./operations/getProfile";
import { getVerifiedEmail } from "./operations/getVerifiedEmail";
import { getConfig, isConfigured } from "./utils/getConfig";

// Everything that talks to GitHub for the sign in. The provider reads its own
// environment variables and throws the OAuth errors of `@standin/contracts`.
export const GithubProvider = {
    // Whether the login is on. The single source of that decision.
    isConfigured,
    getConfig,
    getAuthUrl,
    exchangeCode,
    getProfile,
    getVerifiedEmail,
    downloadAvatar,
};

export type { GithubConfig, GithubProfile } from "./types";
