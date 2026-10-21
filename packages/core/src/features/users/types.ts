import type { User, UserSummary } from "@standin/contracts";

// What `userSelect` and `userSummarySelect` return. The file id becomes the
// `profilePictureUrl` in `toUser` and `toUserSummary`.
export type UserRow = Omit<User, "profilePictureUrl"> & {
    profilePictureFileId: string | null;
};

export type UserSummaryRow = Omit<UserSummary, "profilePictureUrl"> & {
    profilePictureFileId: string | null;
};

// A person was renamed. Sent only when the name really changed.
export type UserNameChange = {
    userId: string;
    name: string;
};

export type UserNameListener = (change: UserNameChange) => void | Promise<void>;

// A person changed or removed the profile picture. The URL is null when it was
// removed.
export type UserProfilePictureChange = {
    userId: string;
    profilePictureUrl: string | null;
};

export type UserProfilePictureListener = (
    change: UserProfilePictureChange
) => void | Promise<void>;
