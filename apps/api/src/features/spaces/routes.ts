import { Router } from "express";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { SpaceController } from "./controllers";

const router = Router({ mergeParams: true });

router.post("/", RequiresPermission("create", "space"), SpaceController.create);

router.get("/", RequiresPermission("read", "space"), SpaceController.list);

router.get(
    "/:spaceId",
    RequiresPermission("read", "space"),
    SpaceController.details
);

router.put(
    "/:spaceId",
    RequiresPermission("update", "space"),
    SpaceController.update
);

router.delete(
    "/:spaceId",
    RequiresPermission("delete", "space"),
    RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
    SpaceController.delete
);

export const spacesRouter = router;
