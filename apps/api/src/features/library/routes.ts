import { Router } from "express";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { LibraryController } from "./controllers";
import { RequiresLibraryAdmin } from "./middleware/requiresLibraryAdmin";
import {
    handleLibraryUploadError,
    uploadLibraryParts,
} from "./middleware/uploadLibraryMiddleware";

// The library is built here, by the admin, on the global library. Reading it
// for a map goes through the maps routes.
const router = Router();

router.use(RequiresLibraryAdmin);

router.get(
    "/overview",
    RequiresPermission("read", "asset"),
    LibraryController.overview
);

router.post(
    "/assets",
    RequiresPermission("create", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.assets.create
);
router.get(
    "/assets",
    RequiresPermission("read", "asset"),
    LibraryController.assets.list
);
router.get(
    "/assets/facets",
    RequiresPermission("read", "asset"),
    LibraryController.assets.facets
);
router.get(
    "/assets/:assetId",
    RequiresPermission("read", "asset"),
    LibraryController.assets.details
);
router.post(
    "/assets/:baseId/variants",
    RequiresPermission("create", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.assets.createVariant
);
router.patch(
    "/assets/:assetId",
    RequiresPermission("update", "asset"),
    LibraryController.assets.update
);
router.patch(
    "/assets/:assetId/color",
    RequiresPermission("update", "asset"),
    LibraryController.assets.updateColor
);
router.put(
    "/assets/:assetId/image",
    RequiresPermission("update", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.assets.replaceImage
);
router.put(
    "/assets/:assetId/parts",
    RequiresPermission("update", "asset"),
    LibraryController.assets.setParts
);
router.delete(
    "/assets/:assetId",
    RequiresPermission("delete", "asset"),
    LibraryController.assets.delete
);

export const libraryRouter = router;
