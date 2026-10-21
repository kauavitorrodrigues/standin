import { resolveFileUrl } from "@/lib/api/assetUrl";

/**
 * The address the browser loads the profile picture from. The API hands out
 * the path (`/files/:id`) and this is the only place that puts the address of
 * the API in front of it. No picture gives undefined, so the initial shows.
 */
export const resolveProfilePictureUrl = (
    profilePictureUrl: string | null | undefined,
    apiBaseUrl: string
): string | undefined => {
    if (!profilePictureUrl) return undefined;

    return resolveFileUrl(profilePictureUrl, apiBaseUrl);
};
