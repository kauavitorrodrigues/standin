import { authenticateFromRequest } from "./authenticateFromRequest";
import { authenticateFromServiceToken } from "./authenticateFromServiceToken";
import { authenticateFromToken } from "./authenticateFromToken";
import { createToken } from "./createToken";

export const AuthService = {
    createToken,
    authenticate: authenticateFromRequest,
    authenticateFromToken,
    authenticateFromServiceToken,
};
