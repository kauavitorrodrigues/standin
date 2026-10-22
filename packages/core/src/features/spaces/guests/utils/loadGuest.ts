import {
    db,
    spaceGuestsTable,
    userProfilePicturesTable,
    usersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { SpaceGuestNotFoundError } from "@standin/contracts";
import type { SpaceGuest } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { guestRowWithNameSelect } from "../consts/select";
import { serializeGuest } from "./serializeGuest";
import { profilePictureJoin } from "../../../users/utils/profilePictureJoin";

/** A guest of the space by the id of the row, with the name of the person. */
export const loadGuest = async (
    spaceId: string,
    guestId: string,
    executor: DbExecutor = db
): Promise<SpaceGuest> => {
    const [row] = await executor
        .select(guestRowWithNameSelect)
        .from(spaceGuestsTable)
        .innerJoin(usersTable, eq(usersTable.id, spaceGuestsTable.userId))
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt)
            )
        );

    if (!row) throw new SpaceGuestNotFoundError();
    return serializeGuest(row);
};
