import { BEARER_PREFIX } from "@/consts/token";
import jwt from "jsonwebtoken";

export const createJWT = (payload: { id: string }) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string);
};

export const verifyJWT = (hash: string) => {
    try {
        return jwt.verify(hash, process.env.JWT_SECRET as string);
    } catch {
        return false;
    }
};

export const extractBearerToken = (authHeader?: string): string | null => {
    if (!authHeader?.startsWith(BEARER_PREFIX)) return null;
    return authHeader.slice(BEARER_PREFIX.length);
};
