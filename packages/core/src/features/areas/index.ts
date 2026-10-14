import { createArea } from "./createArea";
import { deleteArea } from "./deleteArea";
import { getArea } from "./getArea";
import { getMapArea } from "./getMapArea";
import { listAreas } from "./listAreas";
import { renameArea } from "./renameArea";
import { replaceArea } from "./replaceArea";

export const AreaService = {
    create: createArea,
    list: listAreas,
    get: getArea,
    replace: replaceArea,
    rename: renameArea,
    delete: deleteArea,
    getForMap: getMapArea,
};
