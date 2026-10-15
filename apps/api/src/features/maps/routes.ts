import { Router } from "express";
import { MAP_ACCESS_MODES } from "@/consts/mapAccess";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresMapAccess } from "@/middlewares/requiresMapAccess";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { ReadsPublishBody } from "@/middlewares/readsPublishBody";
import { MapController } from "./controllers";

// Maps are not created here: a map is born with its space or its template.
// What is left is reading and editing them.
const router = Router();

router.get(
    "/:mapId/render",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.render
);
router.get(
    "/:mapId/export",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.export
);

// The palette of the editor, for whoever can read the map.
router.get(
    "/:mapId/library",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.library
);

// The stamp of one area to place, for whoever can read the map.
router.get(
    "/:mapId/areas/:areaId",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.area
);

// Who is editing the map, for whoever can read it.
router.get(
    "/:mapId/lock",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.lock
);

// Publishes the draft. The lock guard lets through only the editor session
// that holds the lock, and the body has its own, bigger, size limit.
router.post(
    "/:mapId/publish",
    RequiresMapAccess(MAP_ACCESS_MODES.EDIT),
    RequiresMapNotLocked(MAP_ID_SOURCES.MAP, { allowHolderSession: true }),
    ReadsPublishBody,
    MapController.publish
);

// Objects: the owner edits anything, a member only the items on their own
// desk, which the service checks. A locked map refuses all of them.
router.post(
    "/:mapId/assets",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
    MapController.assets.place
);
router.patch(
    "/:mapId/assets/:assetId",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
    MapController.assets.update
);
router.delete(
    "/:mapId/assets/:assetId",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
    MapController.assets.remove
);

export const mapsRouter = router;
