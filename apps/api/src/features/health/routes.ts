import { Router } from "express";
import { RateLimit } from "@/middlewares/rateLimit";
import {
    HEALTH_RATE_LIMIT_MAX_REQUESTS,
    HEALTH_RATE_LIMIT_WINDOW_MS,
} from "@/consts/health";
import { HealthController } from "./controllers";

const router = Router();

// Open on purpose: the container healthcheck and the post-deploy check call it
// without a session.
router.get(
    "/",
    RateLimit({
        windowMs: HEALTH_RATE_LIMIT_WINDOW_MS,
        max: HEALTH_RATE_LIMIT_MAX_REQUESTS,
    }),
    HealthController.get
);

export const healthRouter = router;
