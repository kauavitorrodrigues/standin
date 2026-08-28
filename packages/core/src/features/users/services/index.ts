import { createUser } from "./create";
import { deleteUser } from "./delete";
import { findUserByEmail } from "./findByEmail";
import { findUserById } from "./findById";
import { isUserValid } from "./isValid";
import { updateUser } from "./update";

export const UserService = {
    create: createUser,
    findByEmail: findUserByEmail,
    findById: findUserById,
    isValid: isUserValid,
    update: updateUser,
    delete: deleteUser,
};
