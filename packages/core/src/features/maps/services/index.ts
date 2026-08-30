import { listMapsByOrganization } from "./listByOrganization";
import { createMap } from "./create";
import { updateMap } from "./update";
import { deleteMap } from "./delete";
import { findResolvedMapById } from "./findResolvedById";

export const MapService = {
    listByOrganization: listMapsByOrganization,
    create: createMap,
    update: updateMap,
    delete: deleteMap,
    findResolvedById: findResolvedMapById,
};
