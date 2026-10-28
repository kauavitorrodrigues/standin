import { Router } from "express";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { handleUploadError } from "../files/middleware/handleUploadError";
import { SpaceController } from "./controllers";
import { uploadSpaceThumbnail } from "./middleware/createThumbnailUploadMiddleware";

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

router.put(
    "/:spaceId/thumbnail",
    RequiresPermission("update", "space"),
    uploadSpaceThumbnail,
    handleUploadError,
    SpaceController.setThumbnail
);

router.delete(
    "/:spaceId",
    RequiresPermission("delete", "space"),
    RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
    SpaceController.delete
);

export const spacesRouter = router;
