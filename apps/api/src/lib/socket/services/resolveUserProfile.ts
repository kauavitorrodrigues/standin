import { UserService } from "@standin/core";
import { UserCache } from "@/features/auth/services/userCache";
import type { PresenceProfile } from "../presence/PresenceStore";

// What the tag shows when a profile could not be read: no name, so the client
// keeps the tag hidden.
const NO_PROFILE: PresenceProfile = { name: "", profilePictureUrl: null };

// The name and the photo of the person who is joining. The user is already in
// the cache from the handshake, so this is normally no query at all. Presence
// must never fail because of a name: any error gives the empty profile, and
// the client keeps the tag hidden until `space:name-changed` or the next join.
export const resolveUserProfile = async (
    userId: string
): Promise<PresenceProfile> => {
    try {
        const cached = UserCache.get(userId);
        if (cached) {
            return {
                name: cached.name,
                profilePictureUrl: cached.profilePictureUrl,
            };
        }

        const user = await UserService.findById(userId);
        if (!user) return NO_PROFILE;

        UserCache.set(user);
        return { name: user.name, profilePictureUrl: user.profilePictureUrl };
    } catch (error) {
        console.error(error);
        return NO_PROFILE;
    }
};
