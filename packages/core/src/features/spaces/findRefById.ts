import { db, spacesTable, and, eq, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import { spaceRefSelect } from "./consts/select";
import type { SpaceRef } from "./types/space-ref";

/** Minimal lookup by space id alone, for routes outside the organization path. */
export const findSpaceRefById = async (id: string): Promise<SpaceRef> => {
    const [space] = await db
        .select(spaceRefSelect)
        .from(spacesTable)
        .where(and(eq(spacesTable.id, id), isNull(spacesTable.deletedAt)));

    if (!space) throw new SpaceNotFoundError();
    return space;
};
