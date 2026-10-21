import { UserService } from "@standin/core";

export type UserProfile = {
    name: string;
    // The photo of the profile, null when the person has none.
    avatarUrl: string | null;
};

// What the tag over each avatar shows, by user id: the name, and the photo it
// shows when it is clicked. Presence must never fail because of a name: any
// error leaves the profiles empty, and the client keeps the tag hidden until
// `space:name-changed` or the next join brings one.
export const resolveUserProfiles = async (
    userIds: string[]
): Promise<Map<string, UserProfile>> => {
    try {
        const users = await UserService.findManyByIds([...new Set(userIds)]);
        return new Map(
            users.map((user) => [
                user.id,
                { name: user.name, avatarUrl: user.avatarUrl },
            ])
        );
    } catch (error) {
        console.error(error);
        return new Map();
    }
};
