import type { UserSummary } from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import type { UserSummaryRow } from "../types";

/** The row of `userSummarySelect` as the `UserSummary` the API sends. */
export const toUserSummary = ({
    profilePictureFileId,
    ...user
}: UserSummaryRow): UserSummary => ({
    ...user,
    profilePictureUrl: profilePictureFileId
        ? buildFileUrl(profilePictureFileId)
        : null,
});
