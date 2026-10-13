import express from "express";
import { RequiresAuth } from "./middlewares/requiresAuth";
import { authRouter } from "./features/auth/routes";
import { usersRouter } from "./features/users/routes";
import { organizationsRouter } from "./features/organizations/routes";
import { iceRouter } from "./features/ice/routes";
import { templatesRouter } from "./features/maps/templates/routes";
import { libraryRouter } from "./features/library/routes";
import { mapsRouter } from "./features/maps/routes";
import { desksRouter } from "./features/desks/routes";
import { filesRouter } from "./features/files/routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/organizations", organizationsRouter);
router.use("/ice-servers", iceRouter);
router.use("/files", filesRouter);

// Template catalog (admin manages, owners read) and the asset library
// (global for the admin, per organization for its owner).
router.use("/templates", RequiresAuth, templatesRouter);
router.use("/library", RequiresAuth, libraryRouter);

// Reading and editing maps, and the desks of a space.
router.use("/maps", RequiresAuth, mapsRouter);
router.use("/spaces/:spaceId/desks", RequiresAuth, desksRouter);

export default router;
