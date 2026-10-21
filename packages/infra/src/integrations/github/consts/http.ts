export const GITHUB_API_VERSION = "2022-11-28";
export const GITHUB_USER_AGENT = "standin";

export const GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
export const GITHUB_API_VERSION_HEADER = "X-GitHub-Api-Version";

// Every call to GitHub gives up after this long, so a GitHub outage cannot
// hold a login request open.
export const GITHUB_REQUEST_TIMEOUT_MS = 8000;

// S256 is the only PKCE method the provider uses.
export const GITHUB_CODE_CHALLENGE_METHOD = "S256";
