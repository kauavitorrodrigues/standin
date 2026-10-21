import { eq, userProfilePicturesTable, usersTable } from "@standin/database";

// Every read of `userSelect` or `userSummarySelect` left joins the profile
// pictures with this condition, so a person with no picture still comes back.
export const profilePictureJoin = eq(
    userProfilePicturesTable.userId,
    usersTable.id
);
