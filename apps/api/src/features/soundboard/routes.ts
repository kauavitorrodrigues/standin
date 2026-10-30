import { Router } from "express";
import { SoundboardController } from "./controllers";
import { uploadClip } from "./middleware/uploadClipMiddleware";
import { ROLES } from "@standin/contracts";
import { RequiresRole } from "@/middlewares/requiresRole";

// The clips of an organization and the default ones, listed together. Any
// member adds a clip; the service decides who renames and deletes.
// Mounted under `/organizations/:organizationId/soundboard/clips`, after
// `RequiresOrgMember`.
const organizationRouter = Router();

organizationRouter.get("/clips", SoundboardController.list);
organizationRouter.post("/clips", uploadClip, SoundboardController.create);
organizationRouter.patch("/clips/:clipId", SoundboardController.update);
organizationRouter.delete("/clips/:clipId", SoundboardController.remove);

// The default clips of the platform. Only the admin manages them; everyone
// reads them with the clips of their organization.
// Mounted under `/soundboard/default-clips`, after `RequiresAuth`.
const defaultRouter = Router();

defaultRouter.use(RequiresRole([ROLES.ADMIN]));
defaultRouter.get("/", SoundboardController.list);
defaultRouter.post("/", uploadClip, SoundboardController.create);

defaultRouter.patch("/:clipId", SoundboardController.update);
defaultRouter.delete("/:clipId", SoundboardController.remove);

export const organizationSoundboardRouter = organizationRouter;
export const defaultSoundboardRouter = defaultRouter;
