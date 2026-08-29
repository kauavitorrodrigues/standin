import { spaceSelect } from "../consts/select";
import { db, spacesTable } from "@standin/database";
import type { Space, SpaceDataSchemaType } from "@standin/contracts";

export const createSpace = async (
    organizationId: string,
    data: SpaceDataSchemaType,
): Promise<Space> => {
    const [space] = await db
        .insert(spacesTable)
        .values({ name: data.name, organizationId })
        .returning(spaceSelect);

    return space;
};
