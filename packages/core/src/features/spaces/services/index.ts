import { createSpace } from "./create";
import { listSpacesByOrganization } from "./listByOrganization";
import { findSpaceById } from "./findById";
import { findSpaceDetailsById } from "./findDetailsById";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";

export const SpaceService = {
    create: createSpace,
    listByOrganization: listSpacesByOrganization,
    findById: findSpaceById,
    findDetailsById: findSpaceDetailsById,
    update: updateSpace,
    delete: deleteSpace,
};
