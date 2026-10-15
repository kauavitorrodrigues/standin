import { Router } from "express";
import { MAP_ACCESS_MODES } from "@/consts/mapAccess";
import { RequiresMapAccess } from "@/middlewares/requiresMapAccess";
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

router.post(
    "/:mapId/layout-ops",
    RequiresMapAccess(MAP_ACCESS_MODES.EDIT),
    MapController.layoutOps
);

// Objects: the owner edits anything, a member only the items on their own
// desk, which the service checks.
router.post(
    "/:mapId/assets",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.assets.place
);
router.patch(
    "/:mapId/assets/:assetId",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.assets.update
);
router.delete(
    "/:mapId/assets/:assetId",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.assets.remove
);

export const mapsRouter = router;
