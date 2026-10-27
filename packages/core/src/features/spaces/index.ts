import { createSpace } from "./create";
import { listSpacesByOrganization } from "./listByOrganization";
import { findSpaceById } from "./findById";
import { findSpaceDetailsById } from "./findDetailsById";
import { findSpaceRefById } from "./findRefById";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";
import { deleteSpacesByOrganizationId } from "./deleteByOrganizationId";
import { findSpaceView } from "./findView";
import { getSpaceSettings } from "./getSettings";
import { updateSpaceSettings } from "./updateSettings";

export const SpaceService = {
    create: createSpace,
    listByOrganization: listSpacesByOrganization,
    findById: findSpaceById,
    findDetailsById: findSpaceDetailsById,
    findView: findSpaceView,
    findRefById: findSpaceRefById,
    update: updateSpace,
    delete: deleteSpace,
    getSettings: getSpaceSettings,
    updateSettings: updateSpaceSettings,
    deleteByOrganizationId: deleteSpacesByOrganizationId,
};

export { SpaceGuestService } from "./guests";
export { SpaceInviteService } from "./guests/invites";
export type { AdmittedGuest, ExpiredGuest, SpaceGuestEvent } from "./guests";
export type { SpaceRef } from "./types/space-ref";
