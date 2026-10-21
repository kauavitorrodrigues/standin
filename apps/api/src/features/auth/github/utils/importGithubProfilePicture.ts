import { GithubProvider } from "@standin/infra";
import { UserService } from "@standin/core";
import { buildProfilePictureAction } from "@/features/users/utils/buildProfilePictureAction";

/**
 * Imports the GitHub photo as the profile picture of a person. The provider
 * downloads the bytes (fixed host, size limit, timeout). They go through the
 * same `buildProfilePictureAction` as an upload, and the core only persists the
 * result.
 *
 * It never throws. Any failure is logged and the person signs in without a
 * photo. Returns whether a photo was saved.
 */
export const importGithubProfilePicture = async (
    userId: string,
    avatarUrl: string | null
): Promise<boolean> => {
    try {
        const bytes = await GithubProvider.downloadAvatar(avatarUrl);
        if (!bytes) return false;

        const action = await buildProfilePictureAction(bytes);
        await UserService.updateProfilePicture(userId, action);

        return true;
    } catch (error) {
        console.error("[GitHub login] profile picture import failed:", error);
        return false;
    }
};
