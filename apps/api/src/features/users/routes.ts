import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { UserController } from "./controllers";
import {
    handleProfilePictureUploadError,
    uploadProfilePictureMiddleware,
} from "./middleware/uploadProfilePictureMiddleware";

const router = Router();

router.put("/me", RequiresAuth, UserController.update);
router.delete("/me", RequiresAuth, UserController.delete);
router.put(
    "/me/profile-picture",
    RequiresAuth,
    uploadProfilePictureMiddleware,
    handleProfilePictureUploadError,
    UserController.setProfilePicture
);
router.delete(
    "/me/profile-picture",
    RequiresAuth,
    UserController.removeProfilePicture
);

export const usersRouter = router;
