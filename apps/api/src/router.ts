import express from "express";
import { RequiresAuth } from "./middlewares/requiresAuth";
import { authRouter } from "./features/auth/routes";
import { usersRouter } from "./features/users/routes";
import { organizationsRouter } from "./features/organizations/routes";
import { healthRouter } from "./features/health/routes";
import { iceRouter } from "./features/ice/routes";
import { templatesRouter } from "./features/maps/templates/routes";
import { TemplateController } from "./features/maps/templates/controllers";
import { libraryRouter } from "./features/library/routes";
import { RequiresLibraryAdmin } from "./features/library/middleware/requiresLibraryAdmin";
import { serviceTokensRouter } from "./features/service-tokens/routes";
import { mapsRouter } from "./features/maps/routes";
import { desksRouter } from "./features/desks/routes";
import {
    guestSpacesAccessRouter,
    invitesAccessRouter,
    spaceAccessRouter,
} from "./features/spaces/guests/routes";
import { spaceSettingsRouter } from "./features/spaces/settings/routes";
import { filesRouter } from "./features/files/routes";
import {
    avatarBasesRouter,
    avatarCatalogRouter,
    avatarCategoriesRouter,
    avatarPartsRouter,
    myAvatarRouter,
} from "./features/avatar/routes";

const router = express.Router();

// For the container healthchecks and the post-deploy check. No session.
router.use("/health", healthRouter);
router.use("/auth", authRouter);
// The avatar of the signed in user. It comes before the users router, which
// only has `/me`.
router.use("/users/me/avatar", myAvatarRouter);
// The spaces the person entered as a guest. Also before the users router.
router.use("/users/me/guest-spaces", RequiresAuth, guestSpacesAccessRouter);
router.use("/users", usersRouter);
router.use("/organizations", organizationsRouter);
router.use("/ice-servers", iceRouter);
router.use("/files", filesRouter);

// How a published template, or a blank map of a tier, looks. Open to anyone so
// the page that starts a space can show it. It must come before the guarded catalog below.
router.get("/templates/:templateId/preview", TemplateController.preview);
router.get(
    "/templates/blank/:sizeTier/preview",
    TemplateController.previewBlank
);

// Template catalog (admin manages, owners read) and the asset library
// (global for the admin, per organization for its owner).
router.use("/templates", RequiresAuth, templatesRouter);
// The avatar parts, categories and bases are global and written by the admin only. They are mounted
// here, ahead of the library router, because that one is shared with the
// library of an organization.
router.use(
    "/library/avatar-parts",
    RequiresAuth,
    RequiresLibraryAdmin,
    avatarPartsRouter
);
router.use(
    "/library/avatar-categories",
    RequiresAuth,
    RequiresLibraryAdmin,
    avatarCategoriesRouter
);
router.use(
    "/library/avatar-bases",
    RequiresAuth,
    RequiresLibraryAdmin,
    avatarBasesRouter
);
router.use("/library", RequiresAuth, RequiresLibraryAdmin, libraryRouter);

// Admin session only: the tokens of tools and agents.
router.use("/service-tokens", RequiresAuth, serviceTokensRouter);

// Catalog of avatar pieces for the editor.
router.use("/avatar", avatarCatalogRouter);

// Reading and editing maps, and the desks of a space.
router.use("/maps", RequiresAuth, mapsRouter);
router.use("/spaces/:spaceId/desks", RequiresAuth, desksRouter);
// A space by its id alone, for members and guests, and the invites to it.
router.use("/spaces", RequiresAuth, spaceAccessRouter);
router.use("/spaces", RequiresAuth, spaceSettingsRouter);
router.use("/invites", RequiresAuth, invitesAccessRouter);

export default router;
