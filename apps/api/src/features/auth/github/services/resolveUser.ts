import { OAuthEmailUnverifiedError, OAUTH_PROVIDERS } from "@standin/contracts";
import type { User } from "@standin/contracts";
import { UserService } from "@standin/core";
import { GithubProvider } from "@standin/infra";
import type { GithubProfile } from "@standin/infra";
import { buildGithubUserName } from "../utils/buildGithubUserName";

// How the person was found, which decides whether the photo is imported.
export type ResolvedGithubUser = {
    user: User;
    outcome: "existing" | "linked" | "created";
};

type ResolveUserInput = {
    accessToken: string;
    profile: GithubProfile;
};

/**
 * Finds the person who is signing in, in this order:
 * 1. The GitHub account is already linked: that person signs in, and GitHub
 *    is not asked for the e-mail.
 * 2. The verified primary e-mail belongs to an active person: the account is
 *    linked to them.
 * 3. Otherwise a new person is created with the GitHub name and e-mail.
 * With no verified primary e-mail, 2 and 3 are refused. A deleted person is
 * never reactivated (the core does not return them).
 */
export const resolveUser = async ({
    accessToken,
    profile,
}: ResolveUserInput): Promise<ResolvedGithubUser> => {
    const identity = {
        provider: OAUTH_PROVIDERS.GITHUB,
        providerUserId: profile.id,
        providerLogin: profile.login,
    };

    const existing = await UserService.findByIdentity(identity);
    if (existing) return { user: existing, outcome: "existing" };

    const email = await GithubProvider.getVerifiedEmail(accessToken);
    if (!email) throw new OAuthEmailUnverifiedError();

    const linked = await UserService.linkIdentity({ identity, email });
    if (linked) return { user: linked, outcome: "linked" };

    const { user, created } = await UserService.createFromIdentity({
        identity,
        email,
        name: buildGithubUserName(profile),
    });

    return { user, outcome: created ? "created" : "existing" };
};
