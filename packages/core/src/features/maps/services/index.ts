import { listMapsByOrganization } from "./listByOrganization";
import { createMap } from "./create";
import { updateMap } from "./update";
import { deleteMap } from "./delete";

export const MapService = {
    listByOrganization: listMapsByOrganization,
    create: createMap,
    update: updateMap,
    delete: deleteMap,
};
