import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { AuthController } from "./controllers";
import { GithubAuthController } from "./github/controllers";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.post("/signout", RequiresAuth, AuthController.signout);
// Public. The GitHub routes answer 404 when the login is off.
router.get("/providers", GithubAuthController.providers);
router.get("/github", GithubAuthController.start);
router.get("/github/callback", GithubAuthController.callback);
router.get("/validate", RequiresAuth, AuthController.validate);

export const authRouter = router;
