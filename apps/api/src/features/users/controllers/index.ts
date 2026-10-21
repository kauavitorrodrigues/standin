import { updateUser } from "./update";
import { deleteUser } from "./delete";
import { setProfilePicture } from "./setProfilePicture";
import { removeProfilePicture } from "./removeProfilePicture";

export const UserController = {
    update: updateUser,
    delete: deleteUser,
    setProfilePicture,
    removeProfilePicture,
};
