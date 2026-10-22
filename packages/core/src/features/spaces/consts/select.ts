import { spacesTable } from "@standin/database";

export const spaceSelect = {
    id: spacesTable.id,
    name: spacesTable.name,
    organizationId: spacesTable.organizationId,
    mapId: spacesTable.mapId,
    guestAccess: spacesTable.guestAccess,
    createdAt: spacesTable.createdAt,
};

export const spaceRefSelect = {
    id: spacesTable.id,
    mapId: spacesTable.mapId,
    organizationId: spacesTable.organizationId,
};
