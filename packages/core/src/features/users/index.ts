import { createUser } from "./create";
import { deleteUser } from "./delete";
import { findUserByEmail } from "./findByEmail";
import { findUserById } from "./findById";
import { findUsersByIds } from "./findManyByIds";
import { isUserValid } from "./isValid";
import { updateUser } from "./update";
import { updateProfilePicture } from "./updateProfilePicture";
import { onUserNameChanged } from "./utils/nameEvents";
import { onUserProfilePictureChanged } from "./utils/profilePictureEvents";

export const UserService = {
    create: createUser,
    findByEmail: findUserByEmail,
    findById: findUserById,
    findManyByIds: findUsersByIds,
    isValid: isUserValid,
    update: updateUser,
    // Hook for the socket: runs after a person is renamed.
    onNameChanged: onUserNameChanged,
    // Persists a profile picture the API already processed (set or remove),
    // whatever its source: the upload now, the GitHub import later.
    updateProfilePicture,
    // Hook for the socket: runs after a profile picture is set or removed.
    onProfilePictureChanged: onUserProfilePictureChanged,
    delete: deleteUser,
};

export type {
    UserNameChange,
    UserNameListener,
    UserProfilePictureChange,
    UserProfilePictureListener,
} from "./types";
