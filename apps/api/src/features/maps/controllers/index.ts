import { listMaps } from "./list";
import { createMap } from "./create";
import { updateMap } from "./update";
import { deleteMap } from "./delete";

export const MapController = {
    list: listMaps,
    create: createMap,
    update: updateMap,
    delete: deleteMap,
};
