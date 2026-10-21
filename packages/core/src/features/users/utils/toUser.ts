import type { User } from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import type { UserRow } from "../types";

/** The row of `userSelect` as the `User` the API sends. */
export const toUser = ({ profilePictureFileId, ...user }: UserRow): User => ({
    ...user,
    profilePictureUrl: profilePictureFileId
        ? buildFileUrl(profilePictureFileId)
        : null,
});
