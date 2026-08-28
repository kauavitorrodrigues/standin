import type { Request } from "express";
import { UserService } from "@standin/core";
import { extractBearerToken, verifyJWT } from "@/lib/jwt";
import type { TokenPayload } from "@/types/token";

export const authenticateFromRequest = async (req: Request) => {
    const token =
        extractBearerToken(req.headers.authorization) ?? req.cookies?.token;
    if (!token) return false;

    const payload = verifyJWT(token) as TokenPayload | false;
    if (!payload) return false;

    const user = await UserService.findById(payload.id);
    if (!user) return false;

    return user;
};
