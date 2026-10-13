import { templateSelect } from "../consts/select";
import {
    db,
    mapTemplatesTable,
    mapsTable,
    filesTable,
    eq,
} from "@standin/database";

// Template rows with their map dimensions and thumbnail, the base of every
// template read. Callers add their own `where`.
export const selectTemplates = () =>
    db
        .select(templateSelect)
        .from(mapTemplatesTable)
        .innerJoin(mapsTable, eq(mapsTable.id, mapTemplatesTable.mapId))
        .leftJoin(
            filesTable,
            eq(filesTable.id, mapTemplatesTable.thumbnailFileId)
        );
