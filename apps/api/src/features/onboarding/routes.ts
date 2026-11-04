import { Router } from "express";
import { OnboardingController } from "./controllers";

// The progress belongs to the signed in person, not to a space.
// Mounted under `/onboarding`, after `RequiresAuth`.
const router = Router();

router.get("/", OnboardingController.get);
router.put("/tasks/:taskKey", OnboardingController.markTask);

export const onboardingRouter = router;
