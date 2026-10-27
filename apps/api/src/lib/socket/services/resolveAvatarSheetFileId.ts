import { AvatarService } from "@standin/core";

// Presence must never fail because of the avatar. Any error while reading the
// sheet leaves the person as the ghost for now. The join only reads: the sheet
// is assembled when the avatar is edited. The one exception is a person whose
// last assembly failed, who is assembled again in the background, so the join
// never waits for it and the new sheet reaches the space as a sheet change.
export const resolveAvatarSheetFileId = async (
    userId: string
): Promise<string | null> => {
    try {
        if (AvatarService.consumeStaleSheet(userId)) {
            void AvatarService.ensureSheetUpToDate(userId).catch(
                (error: unknown) => console.error(error)
            );
        }
        return await AvatarService.resolveSheetFileId(userId);
    } catch (error) {
        console.error(error);
        return null;
    }
};
