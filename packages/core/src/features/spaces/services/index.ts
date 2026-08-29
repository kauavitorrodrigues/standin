import { createSpace } from "./create";
import { listSpacesByOrganization } from "./listByOrganization";
import { findSpaceById } from "./findById";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";

export const SpaceService = {
    create: createSpace,
    listByOrganization: listSpacesByOrganization,
    findById: findSpaceById,
    update: updateSpace,
    delete: deleteSpace,
};
