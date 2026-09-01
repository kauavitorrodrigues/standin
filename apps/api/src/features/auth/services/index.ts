import { authenticateFromRequest } from "./authenticateFromRequest";
import { authenticateFromToken } from "./authenticateFromToken";
import { createToken } from "./createToken";

export const AuthService = {
    createToken,
    authenticate: authenticateFromRequest,
    authenticateFromToken,
};
