import { Router } from "express";
import { ROLES } from "@standin/auth";
import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresMapNotLocked } from "@/middlewares/requiresMapNotLocked";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { RequiresRole } from "@/middlewares/requiresRole";
import { handleUploadError } from "../../files/middleware/handleUploadError";
import { uploadTemplateThumbnail } from "./middleware/createThumbnailUploadMiddleware";
import { TemplateController } from "./controllers";

const router = Router();

// The admin sees every template, an organization owner the published ones.
router.get("/", TemplateController.list);

// Everything below is the admin's.
router.use(RequiresRole([ROLES.ADMIN]));

router.post(
    "/",
    RequiresPermission("create", "template"),
    TemplateController.create
);
router.get(
    "/:templateId",
    RequiresPermission("read", "template"),
    TemplateController.details
);
router.patch(
    "/:templateId",
    RequiresPermission("update", "template"),
    TemplateController.update
);
router.put(
    "/:templateId/thumbnail",
    RequiresPermission("update", "template"),
    uploadTemplateThumbnail,
    handleUploadError,
    TemplateController.setThumbnail
);
router.post(
    "/:templateId/publish",
    RequiresPermission("update", "template"),
    TemplateController.publish
);
router.post(
    "/:templateId/retire",
    RequiresPermission("update", "template"),
    TemplateController.retire
);
router.delete(
    "/:templateId",
    RequiresPermission("delete", "template"),
    RequiresMapNotLocked(MAP_ID_SOURCES.TEMPLATE),
    TemplateController.delete
);

// WARNING: every route on this router must carry RequiresAuth.scoped, because
// it is mounted ahead of the session-only RequiresAuth and nothing else guards
// it. Never add a route here without it.
// The template reads a service token may call with the templates:read scope.
// Guards are given per route, never with `use`, so the paths this router does
// not have fall through to the session router. A session passes the scope
// guard too, so the list keeps its own admin and owner logic: an owner who is
// not an admin still gets the published catalog. A token acts as an admin.
const readRouter = Router();

readRouter.get(
    "/",
    RequiresAuth.scoped("templates:read"),
    TemplateController.list
);
readRouter.get(
    "/:templateId",
    RequiresAuth.scoped("templates:read"),
    RequiresRole([ROLES.ADMIN]),
    RequiresPermission("read", "template"),
    TemplateController.details
);

// WARNING: every route on this router must carry RequiresAuth.scoped, because
// it is mounted ahead of the session-only RequiresAuth and nothing else guards
// it. Never add a route here without it.
// The template writes a service token may call with the templates:write
// scope: create, thumbnail and publish. Update, retire and delete stay
// session-only. Guards are per route for the same reason as above.
const writeRouter = Router();

writeRouter.post(
    "/",
    RequiresAuth.scoped("templates:write"),
    RequiresRole([ROLES.ADMIN]),
    RequiresPermission("create", "template"),
    TemplateController.create
);
writeRouter.put(
    "/:templateId/thumbnail",
    RequiresAuth.scoped("templates:write"),
    RequiresRole([ROLES.ADMIN]),
    RequiresPermission("update", "template"),
    uploadTemplateThumbnail,
    handleUploadError,
    TemplateController.setThumbnail
);
writeRouter.post(
    "/:templateId/publish",
    RequiresAuth.scoped("templates:write"),
    RequiresRole([ROLES.ADMIN]),
    RequiresPermission("update", "template"),
    TemplateController.publish
);

export const templatesRouter = router;
export const templatesReadRouter = readRouter;
export const templatesWriteRouter = writeRouter;
