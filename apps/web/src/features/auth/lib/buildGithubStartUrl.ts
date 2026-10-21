import { API_BASE_URL } from "@/lib/api/url";
import { resolveFileUrl } from "@/lib/api/assetUrl";

const GITHUB_START_PATH = "/auth/github";

// A plain link to the API, which sends the browser to GitHub. It follows the
// API base the other urls follow: the API origin, or the "/api" prefix of the
// LAN mode.
export const buildGithubStartUrl = (
    apiBaseUrl: string = API_BASE_URL
): string => resolveFileUrl(GITHUB_START_PATH, apiBaseUrl);
