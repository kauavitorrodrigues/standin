import { Router } from "express";
import { MapController } from "./controllers";
import { uploadMapFiles } from "./middleware/createMapUploadMiddleware";
import { handleUploadError } from "../files/middleware/handleUploadError";

const router = Router({ mergeParams: true });

router.post("/", uploadMapFiles, handleUploadError, MapController.create);
router.get("/", MapController.list);
router.put("/:mapId", MapController.update);
router.delete("/:mapId", MapController.delete);

export const mapsRouter = router;
