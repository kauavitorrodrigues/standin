import { GITHUB_AVATAR_HOST } from "../consts/avatar";

/** The url when it is https on the GitHub avatar host, otherwise null. */
export const parseAvatarUrl = (value: string, base?: string): URL | null => {
    try {
        const url = new URL(value, base);
        const isAllowed =
            url.protocol === "https:" &&
            url.hostname === GITHUB_AVATAR_HOST &&
            url.port === "" &&
            url.username === "" &&
            url.password === "";

        return isAllowed ? url : null;
    } catch {
        return null;
    }
};
