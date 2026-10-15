import { createSpace } from "./create";
import { listSpacesByOrganization } from "./listByOrganization";
import { findSpaceById } from "./findById";
import { findSpaceDetailsById } from "./findDetailsById";
import { findSpaceRefById } from "./findRefById";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";
import { deleteSpacesByOrganizationId } from "./deleteByOrganizationId";

export const SpaceService = {
    create: createSpace,
    listByOrganization: listSpacesByOrganization,
    findById: findSpaceById,
    findDetailsById: findSpaceDetailsById,
    findRefById: findSpaceRefById,
    update: updateSpace,
    delete: deleteSpace,
    deleteByOrganizationId: deleteSpacesByOrganizationId,
};
