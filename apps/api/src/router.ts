import express from "express";
import { authRouter } from "./features/auth/routes";
import { usersRouter } from "./features/users/routes";
import { organizationsRouter } from "./features/organizations/routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/organizations", organizationsRouter);

export default router;
