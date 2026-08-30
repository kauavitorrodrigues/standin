import { spacesTable } from "@standin/database";

export const spaceSelect = {
    id: spacesTable.id,
    name: spacesTable.name,
    organizationId: spacesTable.organizationId,
    mapId: spacesTable.mapId,
};
