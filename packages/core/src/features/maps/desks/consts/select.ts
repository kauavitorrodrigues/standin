import { deskAssignmentsTable, mapAssetsTable } from "@standin/database";

export const deskRowSelect = {
    id: deskAssignmentsTable.id,
    userId: deskAssignmentsTable.userId,
    mapAssetId: deskAssignmentsTable.mapAssetId,
};

export const deskListSelect = {
    mapAssetId: deskAssignmentsTable.mapAssetId,
    userId: deskAssignmentsTable.userId,
};

export const lockedDeskSelect = { id: mapAssetsTable.id };
