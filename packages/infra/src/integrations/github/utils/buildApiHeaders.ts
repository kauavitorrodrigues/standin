import {
    GITHUB_ACCEPT_HEADER,
    GITHUB_API_VERSION,
    GITHUB_API_VERSION_HEADER,
    GITHUB_USER_AGENT,
} from "../consts/http";

export const buildApiHeaders = (accessToken: string) => ({
    Accept: GITHUB_ACCEPT_HEADER,
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": GITHUB_USER_AGENT,
    [GITHUB_API_VERSION_HEADER]: GITHUB_API_VERSION,
});
