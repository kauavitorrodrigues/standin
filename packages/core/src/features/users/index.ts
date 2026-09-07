import { createUser } from "./create";
import { deleteUser } from "./delete";
import { findUserByEmail } from "./findByEmail";
import { findUserById } from "./findById";
import { findUsersByIds } from "./findManyByIds";
import { isUserValid } from "./isValid";
import { updateUser } from "./update";

export const UserService = {
    create: createUser,
    findByEmail: findUserByEmail,
    findById: findUserById,
    findManyByIds: findUsersByIds,
    isValid: isUserValid,
    update: updateUser,
    delete: deleteUser,
};
