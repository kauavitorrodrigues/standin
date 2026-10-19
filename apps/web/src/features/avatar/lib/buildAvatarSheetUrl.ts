import { API_BASE_URL } from "@/lib/api/url";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { AVATAR_FILES_PATH } from "../consts/paths";

// The address the game loads the assembled sheet of an avatar from.
export const buildAvatarSheetUrl = (
    fileId: string,
    apiBaseUrl: string = API_BASE_URL
): string => resolveFileUrl(`${AVATAR_FILES_PATH}/${fileId}`, apiBaseUrl);
