import express from "express";
import { RequiresAuth } from "./middlewares/requiresAuth";
import { authRouter } from "./features/auth/routes";
import { usersRouter } from "./features/users/routes";
import { organizationsRouter } from "./features/organizations/routes";
import { iceRouter } from "./features/ice/routes";
import { libraryRouter } from "./features/library/routes";
import { filesRouter } from "./features/files/routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/organizations", organizationsRouter);
router.use("/ice-servers", iceRouter);
router.use("/files", filesRouter);
router.use("/library", RequiresAuth, libraryRouter);

export default router;
