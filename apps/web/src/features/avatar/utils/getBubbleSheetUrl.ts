import { AVATAR_PUBLIC_SHEETS } from "../consts/paths";
import { buildAvatarSheetUrl } from "../lib/buildAvatarSheetUrl";

// The sheet the bubble draws. A person without a sheet is the ghost, as in the
// game.
export const getBubbleSheetUrl = (sheetFileId: string | null): string => {
    if (sheetFileId === null) return AVATAR_PUBLIC_SHEETS.GHOST;

    return buildAvatarSheetUrl(sheetFileId);
};
