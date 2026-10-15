import { applyLayoutOps } from "./applyLayoutOps";
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
    applyLayoutOps,
    exportTiled: exportMapAsTiled,
    getAccess: getMapAccess,
    findOwner: findMapOwner,
    loadLibrary: loadLayoutLibrary,
};

export * from "./assets";
export * from "./desks";
export * from "./templates";
