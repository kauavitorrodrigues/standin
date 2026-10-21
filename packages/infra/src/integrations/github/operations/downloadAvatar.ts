import { PROFILE_PICTURE } from "@standin/contracts";
import {
    GITHUB_AVATAR_MAX_REDIRECTS,
    GITHUB_AVATAR_SIZE,
    GITHUB_AVATAR_TIMEOUT_MS,
} from "../consts/avatar";
import { parseAvatarUrl } from "../utils/parseAvatarUrl";

// Reads the body up to the size limit. Returns null when it is bigger.
const readLimited = async (response: Response): Promise<Buffer | null> => {
    const declared = Number(response.headers.get("content-length"));
    if (declared > PROFILE_PICTURE.maxBytes) return null;
    if (!response.body) return null;

    const chunks: Uint8Array[] = [];
    let received = 0;
    const reader = response.body.getReader();

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        received += value.length;
        if (received > PROFILE_PICTURE.maxBytes) {
            await reader.cancel();
            return null;
        }
        chunks.push(value);
    }

    return Buffer.concat(chunks);
};

// Downloads the avatar. A redirect is followed only to an allowed url.
const download = async (start: URL): Promise<Buffer | null> => {
    const signal = AbortSignal.timeout(GITHUB_AVATAR_TIMEOUT_MS);
    let current = start;

    for (let hop = 0; hop <= GITHUB_AVATAR_MAX_REDIRECTS; hop++) {
        const response = await fetch(current, { redirect: "manual", signal });

        const location = response.headers.get("location");
        if (response.status >= 300 && response.status < 400 && location) {
            const next = parseAvatarUrl(location, current.toString());
            if (!next) return null;
            current = next;
            continue;
        }

        if (!response.ok) return null;
        return readLimited(response);
    }

    return null;
};

/**
 * Downloads the GitHub photo and returns its bytes, or null. It accepts only
 * https on the GitHub avatar host (also after a redirect), asks for the 256
 * size, has a short timeout and a size limit. It never throws: any failure is
 * logged and gives null, so a photo can never break a sign in. The bytes are
 * not decoded here.
 */
export const downloadAvatar = async (
    avatarUrl: string | null
): Promise<Buffer | null> => {
    try {
        const parsed = avatarUrl ? parseAvatarUrl(avatarUrl) : null;
        if (!parsed) return null;

        parsed.searchParams.set("s", GITHUB_AVATAR_SIZE);

        return await download(parsed);
    } catch (error) {
        console.error("[GitHub login] avatar download failed:", error);
        return null;
    }
};
