import { resolveFileUrl } from "@/lib/api/assetUrl";

// The address of the photo, or null while the template has none yet.
export const getThumbnailSrc = (
    thumbnailUrl: string | null,
    apiBaseUrl: string
): string | null => {
    if (!thumbnailUrl) return null;
    return resolveFileUrl(thumbnailUrl, apiBaseUrl);
};
