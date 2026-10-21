import { createUser } from "./create";
import { deleteUser } from "./delete";
import { findUserByEmail } from "./findByEmail";
import { findUserById } from "./findById";
import { findUsersByIds } from "./findManyByIds";
import { isUserValid } from "./isValid";
import { updateUser } from "./update";
import { onUserNameChanged } from "./utils/nameEvents";

export const UserService = {
    create: createUser,
    findByEmail: findUserByEmail,
    findById: findUserById,
    findManyByIds: findUsersByIds,
    isValid: isUserValid,
    update: updateUser,
    // Hook for the socket: runs after a person is renamed.
    onNameChanged: onUserNameChanged,
    delete: deleteUser,
};

export type { UserNameChange, UserNameListener } from "./types";
