import { Router } from "express";
import {
    RequiresSpaceHost,
    RequiresSpaceOwner,
} from "@/middlewares/requiresSpaceHost";
import { SpaceSettingsController } from "./controllers";

// Addressed by the space id alone, like the guest routes. Mounted at `/spaces`
// after `RequiresAuth`. The hosts read the settings, only the owner changes them.
const router = Router();

router.get(
    "/:spaceId/settings",
    RequiresSpaceHost,
    SpaceSettingsController.get
);
router.patch(
    "/:spaceId/settings",
    RequiresSpaceOwner,
    SpaceSettingsController.update
);

export const spaceSettingsRouter = router;
