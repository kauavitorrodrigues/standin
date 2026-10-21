import { MAX_USER_NAME_LENGTH } from "@standin/contracts";
import type { GithubProfile } from "@standin/infra";

/** The name GitHub gives, or the login when the name is empty. */
export const buildGithubUserName = ({
    name,
    login,
}: Pick<GithubProfile, "name" | "login">): string => {
    const trimmed = name?.trim();

    return (trimmed || login).slice(0, MAX_USER_NAME_LENGTH);
};
