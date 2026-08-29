import { spaceSelect } from "../consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import type { Space } from "@standin/contracts";

export const findSpaceById = async (id: string): Promise<Space | null> => {
    const [space] = await db
        .select(spaceSelect)
        .from(spacesTable)
        .where(and(eq(spacesTable.id, id), isNull(spacesTable.deletedAt)));

    return space ?? null;
};
