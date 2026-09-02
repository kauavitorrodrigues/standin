import { UserService } from "@standin/core";
import { verifyJWT } from "@/lib/jwt";
import type { TokenPayload } from "@/types/token";

export const authenticateFromToken = async (token: string) => {
    const payload = verifyJWT(token) as TokenPayload | false;
    if (!payload) return false;

    const user = await UserService.findById(payload.id);
    if (!user) return false;

    return user;
};
