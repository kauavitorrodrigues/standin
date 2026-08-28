import { createJWT } from "@/lib/jwt";
import type { User } from "@standin/contracts";

export const createToken = (user: User) => {
    return createJWT({ id: user.id });
};
