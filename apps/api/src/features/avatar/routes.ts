import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { AvatarController } from "./controllers";
import {
    handleAvatarUploadError,
    uploadAvatarPartMiddleware,
} from "./middleware/uploadAvatarPartMiddleware";

// The pieces of the avatar are built by the admin on the global library. This
// router is mounted in `router.ts` after `RequiresAuth` and
// `RequiresLibraryAdmin`, and not inside the library router, because that one
// is also mounted for the owner of an organization and parts are global only.
const partsRouter = Router();

partsRouter.post(
    "/",
    RequiresPermission("create", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.parts.create
);
partsRouter.get(
    "/",
    RequiresPermission("read", "asset"),
    AvatarController.parts.list
);
partsRouter.patch(
    "/:partId",
    RequiresPermission("update", "asset"),
    AvatarController.parts.update
);
partsRouter.put(
    "/:partId/image",
    RequiresPermission("update", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.parts.replaceImage
);
partsRouter.post(
    "/:partId/variations",
    RequiresPermission("create", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.parts.createVariation
);
partsRouter.put(
    "/:partId/preview",
    RequiresPermission("update", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.parts.replacePreview
);
partsRouter.delete(
    "/:partId",
    RequiresPermission("delete", "asset"),
    AvatarController.parts.delete
);

export const avatarPartsRouter = partsRouter;

// The categories of the avatar are fixed by the migration, the admin only
// edits their name, order and image.
const categoriesRouter = Router();

categoriesRouter.get(
    "/",
    RequiresPermission("read", "asset"),
    AvatarController.categories.list
);
categoriesRouter.patch(
    "/:slot",
    RequiresPermission("update", "asset"),
    AvatarController.categories.update
);
categoriesRouter.put(
    "/:slot/preview",
    RequiresPermission("update", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.categories.replacePreview
);
categoriesRouter.delete(
    "/:slot/preview",
    RequiresPermission("update", "asset"),
    AvatarController.categories.removePreview
);

export const avatarCategoriesRouter = categoriesRouter;

// The blank avatars, the body every part is drawn on.
const basesRouter = Router();

basesRouter.get(
    "/",
    RequiresPermission("read", "asset"),
    AvatarController.bases.list
);
basesRouter.post(
    "/",
    RequiresPermission("create", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.bases.create
);
basesRouter.patch(
    "/:baseId",
    RequiresPermission("update", "asset"),
    AvatarController.bases.update
);
basesRouter.put(
    "/:baseId/image",
    RequiresPermission("update", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.bases.replaceImage
);
basesRouter.put(
    "/:baseId/preview",
    RequiresPermission("update", "asset"),
    uploadAvatarPartMiddleware,
    handleAvatarUploadError,
    AvatarController.bases.replacePreview
);
basesRouter.delete(
    "/:baseId/preview",
    RequiresPermission("update", "asset"),
    AvatarController.bases.removePreview
);
basesRouter.delete(
    "/:baseId",
    RequiresPermission("delete", "asset"),
    AvatarController.bases.delete
);

export const avatarBasesRouter = basesRouter;

// The editor of the avatar, open to any signed in user.
const catalogRouter = Router();

catalogRouter.get("/editor", RequiresAuth, AvatarController.editor.get);
catalogRouter.get(
    "/categories/:slot/parts",
    RequiresAuth,
    AvatarController.editor.categoryParts
);

export const avatarCatalogRouter = catalogRouter;

// The avatar of the signed in user, mounted at `/users/me/avatar`.
const meRouter = Router();

meRouter.get("/", RequiresAuth, AvatarController.me.get);
meRouter.put("/", RequiresAuth, AvatarController.me.set);
meRouter.delete("/", RequiresAuth, AvatarController.me.clear);

export const myAvatarRouter = meRouter;
