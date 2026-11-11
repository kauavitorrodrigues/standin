import { Router } from "express";
import { MAP_ACCESS_MODES } from "@/consts/mapAccess";
import { RateLimit } from "@/middlewares/rateLimit";
import { RequiresMapAccess } from "@/middlewares/requiresMapAccess";
import { WebsiteController } from "./controllers";
import { WEBSITE_PREVIEW_RATE_LIMIT } from "./preview/consts";

const router = Router();

// The title and icon of the website of an object, for whoever can see the map,
// guests included. The server fetches the page, so the route is rate limited.
router.get(
    "/:mapId/websites/:assetId/preview",
    RequiresMapAccess(MAP_ACCESS_MODES.VIEW),
    RateLimit({
        windowMs: WEBSITE_PREVIEW_RATE_LIMIT.WINDOW_MS,
        max: WEBSITE_PREVIEW_RATE_LIMIT.MAX,
    }),
    WebsiteController.preview
);

export const websitesRouter = router;
