import { Router } from "express";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { MapController } from "./controllers";
import { uploadMapFiles } from "./middleware/createMapUploadMiddleware";
import { handleUploadError } from "../files/middleware/handleUploadError";

const router = Router({ mergeParams: true });

router.post(
    "/",
    RequiresPermission("create", "map"),
    uploadMapFiles,
    handleUploadError,
    MapController.create
);

router.get("/", RequiresPermission("read", "map"), MapController.list);

router.put(
    "/:mapId",
    RequiresPermission("update", "map"),
    MapController.update
);

router.delete(
    "/:mapId",
    RequiresPermission("delete", "map"),
    MapController.delete
);

export const mapsRouter = router;
