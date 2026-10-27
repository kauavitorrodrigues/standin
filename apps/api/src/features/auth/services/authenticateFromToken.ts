import { UserService } from "@standin/core";
import { verifyJWT } from "@/lib/jwt";
import type { TokenPayload } from "@/types/token";
import { UserCache } from "./userCache";

export const authenticateFromToken = async (token: string) => {
    const payload = verifyJWT(token) as TokenPayload | false;
    if (!payload) return false;

    const cached = UserCache.get(payload.id);
    if (cached) return cached;

    const user = await UserService.findById(payload.id);
    if (!user) return false;

    UserCache.set(user);
    return user;
};
