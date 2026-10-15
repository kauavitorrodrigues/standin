import { Router } from "express";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { RequiresMapOwner } from "@/middlewares/requiresMapOwner";
import { RequiresSpaceAccess } from "@/middlewares/requiresSpaceAccess";
import { DeskController } from "./controllers";

const router = Router({ mergeParams: true });

router.use(RequiresSpaceAccess);

router.get("/", DeskController.list);

// Desks change the map, so a locked map refuses all three. The space of the
// route gives the map.
router.post(
    "/:mapAssetId/claim",
    RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
    DeskController.claim
);

router.delete(
    "/:mapAssetId/claim",
    RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
    DeskController.release
);

// Only the owner of the organization hands desks out.
router.post(
    "/:mapAssetId/assign",
    RequiresMapOwner,
    RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
    DeskController.assign
);

export const desksRouter = router;
