import { buildMapRenderPayload } from "./buildRenderPayload";
import { copyMap } from "./copy";
import { createBlankMap } from "./createBlank";
import { deleteMapsByIds } from "./deleteByIds";
import { exportMapAsTiled } from "./exportTiled";
import { findMapOwner } from "./findOwner";
import { findResolvedMapById } from "./findResolvedById";
import { getMapAccess } from "./getAccess";
import { loadLayoutLibrary } from "./utils/loadLayoutLibrary";

export type { MapAccess } from "./types/map-access";
export type { MapOwner } from "./types/map-owner";

export const MapService = {
    createBlank: createBlankMap,
    copy: copyMap,
    deleteByIds: deleteMapsByIds,
    findResolvedById: findResolvedMapById,
    buildRenderPayload: buildMapRenderPayload,
    exportTiled: exportMapAsTiled,
    getAccess: getMapAccess,
    findOwner: findMapOwner,
    loadLibrary: loadLayoutLibrary,
};

export { MapAssetService } from "./assets";
export { DeskService } from "./desks";
export { MapLockService } from "./lock";
export { MapPublishService } from "./publish";
export { MapTemplateService } from "./templates";
