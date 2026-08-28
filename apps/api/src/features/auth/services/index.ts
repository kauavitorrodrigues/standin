import { authenticateFromRequest } from "./authenticateFromRequest";
import { createToken } from "./createToken";

export const AuthService = {
    createToken,
    authenticate: authenticateFromRequest,
};
