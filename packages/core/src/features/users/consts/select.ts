import { userProfilePicturesTable, usersTable } from "@standin/database";

// Both selects need the profile picture join, see `profilePictureJoin`.
export const userSelect = {
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    profilePictureFileId: userProfilePicturesTable.fileId,
};

export const userSummarySelect = {
    id: usersTable.id,
    name: usersTable.name,
    profilePictureFileId: userProfilePicturesTable.fileId,
};
