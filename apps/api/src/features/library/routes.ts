import { Router } from "express";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { LibraryController } from "./controllers";
import {
    handleLibraryUploadError,
    uploadLibraryParts,
} from "./middleware/uploadLibraryMiddleware";

// The library is built here: by the admin on the global library, and by the
// owner of an organization on its own. The mount decides the scope (see
// `RequiresLibraryAdmin` and `RequiresLibraryOwner`), so both share these
// routes. Reading it for a map goes through the maps routes.
const router = Router();

router.get(
    "/overview",
    RequiresPermission("read", "asset"),
    LibraryController.overview
);

router.get(
    "/palette",
    RequiresPermission("read", "asset"),
    LibraryController.palette
);

router.post(
    "/tilesets",
    RequiresPermission("create", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.tilesets.create
);
router.get(
    "/tilesets",
    RequiresPermission("read", "asset"),
    LibraryController.tilesets.list
);
router.get(
    "/tilesets/:tilesetId",
    RequiresPermission("read", "asset"),
    LibraryController.tilesets.details
);
router.patch(
    "/tilesets/:tilesetId",
    RequiresPermission("update", "asset"),
    LibraryController.tilesets.update
);
router.put(
    "/tilesets/:tilesetId/tile-meta",
    RequiresPermission("update", "asset"),
    LibraryController.tilesets.replaceTileMeta
);
router.put(
    "/tilesets/:tilesetId/grid",
    RequiresPermission("update", "asset"),
    LibraryController.tilesets.replaceGrid
);
router.delete(
    "/tilesets/:tilesetId",
    RequiresPermission("delete", "asset"),
    LibraryController.tilesets.delete
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

router.post(
    "/areas",
    RequiresPermission("create", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.areas.create
);
router.get(
    "/areas",
    RequiresPermission("read", "asset"),
    LibraryController.areas.list
);
router.get(
    "/areas/:areaId",
    RequiresPermission("read", "asset"),
    LibraryController.areas.details
);
router.put(
    "/areas/:areaId",
    RequiresPermission("update", "asset"),
    uploadLibraryParts,
    handleLibraryUploadError,
    LibraryController.areas.replace
);
router.patch(
    "/areas/:areaId",
    RequiresPermission("update", "asset"),
    LibraryController.areas.rename
);
router.delete(
    "/areas/:areaId",
    RequiresPermission("delete", "asset"),
    LibraryController.areas.remove
);

export const libraryRouter = router;
