import { Router } from "express";
import { MAP_ACCESS_MODES } from "@/consts/mapAccess";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresMapAccess } from "@/middlewares/requiresMapAccess";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { ReadsPublishBody } from "@/middlewares/readsPublishBody";
import { MapController } from "./controllers";

// Maps are not created here: a map is born with its space or its template.
// What is left is reading and editing them.
const router = Router();

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

// Publishes the draft. Reading is enough here: the service asks for canEdit or
// canDecorate by the scope of the body. The lock guard lets through only the
// editor session that holds the lock, and the body has its own, bigger, size limit.
router.post(
    "/:mapId/publish",
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
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

// WARNING: every route on this router must carry RequiresAuth.scoped, because
// it is mounted ahead of the session-only RequiresAuth and nothing else guards
// it. Never add a route here without it.
// The map write a service token may call (maps:write); its reads are on
// readRouter below. It is mounted before the session-only maps router (see
// router.ts). Reading is enough here: the service asks for canEdit. There is
// no lock guard, because the service takes the lock itself and refuses with
// the same 423 when an editor holds it.
const applyRouter = Router();
applyRouter.post(
    "/:mapId/apply",
    RequiresAuth.scoped("maps:write"),
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    ReadsPublishBody,
    MapController.apply
);

// WARNING: every route on this router must carry RequiresAuth.scoped, because
// it is mounted ahead of the session-only RequiresAuth and nothing else guards
// it. Never add a route here without it.
// The map routes a service token may read with the maps:read scope. It is
// mounted before the session-only maps router (see router.ts), so a token
// reaches nothing else. A session passes too, with the same map access as
// before. The map access follows the owner of the token, an admin, so
// maps:read also reads the map of any template, not only the maps of spaces.
const readRouter = Router();

// The one map route a guest of the space may call: the render, to see the map.
readRouter.get(
    "/:mapId/render",
    RequiresAuth.scoped("maps:read"),
    RequiresMapAccess(MAP_ACCESS_MODES.VIEW),
    MapController.render
);
readRouter.get(
    "/:mapId/export",
    RequiresAuth.scoped("maps:read"),
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.export
);

// The palette of the editor, for whoever can read the map.
readRouter.get(
    "/:mapId/library",
    RequiresAuth.scoped("maps:read"),
    RequiresMapAccess(MAP_ACCESS_MODES.READ),
    MapController.library
);

export const mapsRouter = router;
export const mapReadRouter = readRouter;
export const mapApplyRouter = applyRouter;
