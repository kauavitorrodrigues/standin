import {
    spaceGuestsTable,
    userProfilePicturesTable,
    usersTable,
} from "@standin/database";

export const guestRowSelect = {
    id: spaceGuestsTable.id,
    spaceId: spaceGuestsTable.spaceId,
    userId: spaceGuestsTable.userId,
    status: spaceGuestsTable.status,
    statusReason: spaceGuestsTable.statusReason,
    respondedBy: spaceGuestsTable.respondedBy,
    respondedAt: spaceGuestsTable.respondedAt,
    expiresAt: spaceGuestsTable.expiresAt,
    requestedAt: spaceGuestsTable.requestedAt,
};

export const guestRowWithNameSelect = {
    ...guestRowSelect,
    name: usersTable.name,
    profilePictureFileId: userProfilePicturesTable.fileId,
};
