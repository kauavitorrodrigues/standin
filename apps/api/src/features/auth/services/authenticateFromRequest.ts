import type { Request } from "express";
import { extractBearerToken } from "@/lib/jwt";
import { authenticateFromToken } from "./authenticateFromToken";

export const authenticateFromRequest = async (req: Request) => {
    const token =
        extractBearerToken(req.headers.authorization) ?? req.cookies?.token;
    if (!token) return false;

    return authenticateFromToken(token);
};
