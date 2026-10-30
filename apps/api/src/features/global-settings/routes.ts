import { Router } from "express";
import { ROLES } from "@standin/contracts";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresRole } from "@/middlewares/requiresRole";
import { GlobalSettingsController } from "./controllers";

// Public: whether sign up is open, for the sign up page.
const publicRouter = Router();
publicRouter.get("/settings", GlobalSettingsController.getPublicSettings);
// For the signed in person: which creations the switches allow them.
publicRouter.get(
    "/capabilities",
    RequiresAuth,
    GlobalSettingsController.getCapabilities
);

export const globalSettingsPublicRouter = publicRouter;

// Mounted behind the plain `RequiresAuth`, which only takes a session, so a
// service token can never change who may use the instance.
const adminRouter = Router();
adminRouter.use(RequiresRole([ROLES.ADMIN]));

adminRouter.get("/settings", GlobalSettingsController.getSettings);
adminRouter.put("/settings", GlobalSettingsController.updateSettings);
adminRouter.get("/users", GlobalSettingsController.listUsers);
adminRouter.get("/organizations", GlobalSettingsController.listOrganizations);

export const globalSettingsAdminRouter = adminRouter;
