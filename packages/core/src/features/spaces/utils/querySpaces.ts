import { spaceReadSelect } from "../consts/select";
import {
    db,
    spacesTable,
    filesTable,
    and,
    eq,
    isNull,
} from "@standin/database";

// Space rows with their thumbnail, the base of every space read. A file that
// was removed shows as no thumbnail, the same as `serializeReturnedSpace`.
// Callers add their own `where`.
export const selectSpaces = () =>
    db
        .select(spaceReadSelect)
        .from(spacesTable)
        .leftJoin(
            filesTable,
            and(
                eq(filesTable.id, spacesTable.thumbnailFileId),
                isNull(filesTable.deletedAt)
            )
        );
