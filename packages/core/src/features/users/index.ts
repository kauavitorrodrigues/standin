import { createUser } from "./create";
import { deleteUser } from "./delete";
import { findUserByEmail } from "./findByEmail";
import { findUserById } from "./findById";
import { findUsersByIds } from "./findManyByIds";
import { createUserFromIdentity } from "./identities/createFromIdentity";
import { findUserByIdentity } from "./identities/findByIdentity";
import { linkIdentity } from "./identities/linkIdentity";
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
    // Sign in with a provider (GitHub). The API reads the provider and hands
    // over prepared data, the core only persists and applies the domain rules.
    findByIdentity: findUserByIdentity,
    linkIdentity,
    createFromIdentity: createUserFromIdentity,
};

export type {
    CreateFromIdentityInput,
    CreateFromIdentityResult,
    IdentityInput,
    IdentityKey,
    LinkIdentityInput,
} from "./identities/types";
export type {
    UserNameChange,
    UserNameListener,
    UserProfilePictureChange,
    UserProfilePictureListener,
} from "./types";
