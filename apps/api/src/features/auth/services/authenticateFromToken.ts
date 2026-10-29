import { verifyJWT } from "@/lib/jwt";
import type { TokenPayload } from "@/types/token";
import { findCachedUser } from "./findCachedUser";

export const authenticateFromToken = async (token: string) => {
    const payload = verifyJWT(token) as TokenPayload | false;
    if (!payload) return false;

    return findCachedUser(payload.id);
};
