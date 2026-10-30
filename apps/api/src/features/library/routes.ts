import { Router, type RequestHandler } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { LibraryController } from "./controllers";
import { RequiresLibraryAdmin } from "./middleware/requiresLibraryAdmin";
import {
    handleLibraryUploadError,
    uploadLibraryParts,
} from "./middleware/uploadLibraryMiddleware";

// The library is built here: by the admin on the global library, and by the
// owner of an organization on its own. The mount decides the scope (see
// `RequiresLibraryAdmin` and `RequiresLibraryOwner`), so both share these
// routes. Reading it for a map goes through the maps routes.
// On `/library` its GETs are answered first by `libraryReadRouter` below
// (they accept a service token); here they serve the organization mount.
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

// WARNING: every route on this router must carry RequiresAuth.scoped, because
// it is mounted ahead of the session-only RequiresAuth and nothing else guards
// it. Never add a route here without it.
// The reads of the global library a service token may call with the
// library:read scope. A token acts as the admin who issued it, so it goes
// through the same admin and permission checks as a session: a token whose
// owner is no longer an admin is refused. Writes are not here.
const readRouter = Router();

// Given per route, never with `readRouter.use`: a use would answer 401 for
// the paths this router does not have, instead of letting them fall through.
const LIBRARY_READ_GUARDS: RequestHandler[] = [
    RequiresAuth.scoped("library:read"),
    RequiresLibraryAdmin,
    RequiresPermission("read", "asset"),
];

readRouter.get("/overview", ...LIBRARY_READ_GUARDS, LibraryController.overview);
readRouter.get("/palette", ...LIBRARY_READ_GUARDS, LibraryController.palette);
readRouter.get(
    "/tilesets",
    ...LIBRARY_READ_GUARDS,
    LibraryController.tilesets.list
);
readRouter.get(
    "/tilesets/:tilesetId",
    ...LIBRARY_READ_GUARDS,
    LibraryController.tilesets.details
);
readRouter.get(
    "/assets",
    ...LIBRARY_READ_GUARDS,
    LibraryController.assets.list
);
readRouter.get(
    "/assets/facets",
    ...LIBRARY_READ_GUARDS,
    LibraryController.assets.facets
);
readRouter.get(
    "/assets/:assetId",
    ...LIBRARY_READ_GUARDS,
    LibraryController.assets.details
);
readRouter.get("/areas", ...LIBRARY_READ_GUARDS, LibraryController.areas.list);
readRouter.get(
    "/areas/:areaId",
    ...LIBRARY_READ_GUARDS,
    LibraryController.areas.details
);

export const libraryRouter = router;
export const libraryReadRouter = readRouter;
