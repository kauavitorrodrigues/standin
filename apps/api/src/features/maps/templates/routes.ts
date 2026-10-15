import { Router } from "express";
import { ROLES } from "@standin/auth";
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
    TemplateController.delete
);

export const templatesRouter = router;
