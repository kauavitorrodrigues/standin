import { AvatarService } from "@standin/core";

// Presence must never fail because of the avatar. Any error while refreshing
// or reading the sheet leaves the person as the ghost for now.
export const resolveAvatarSheetFileId = async (
    userId: string
): Promise<string | null> => {
    try {
        return await AvatarService.ensureSheetUpToDate(userId);
    } catch (error) {
        console.error(error);
        return null;
    }
};
