import { assignRandomAvatar } from "../avatar/user/assignRandomAvatar";
import { insertUser } from "./utils/insertUser";
import { readUser } from "./utils/readUser";
import type { User, UserDataSchemaType } from "@standin/contracts";

export const createUser = async (data: UserDataSchemaType): Promise<User> => {
    const id = await insertUser(data);

    // A new user starts with a random avatar. It never fails the sign up, and
    // an empty catalog leaves the user as the ghost.
    await assignRandomAvatar(id);

    return readUser(id);
};
