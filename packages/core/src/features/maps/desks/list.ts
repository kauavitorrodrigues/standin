import { SpaceService } from "../../spaces";
import { db, deskAssignmentsTable, and, eq, isNull } from "@standin/database";
import { deskListSelect } from "./consts/select";

export const listDesks = async (spaceId: string) => {
    await SpaceService.findRefById(spaceId);

    return db
        .select(deskListSelect)
        .from(deskAssignmentsTable)
        .where(
            and(
                eq(deskAssignmentsTable.spaceId, spaceId),
                isNull(deskAssignmentsTable.deletedAt)
            )
        );
};
