import { authenticateServiceToken } from "./authenticate";
import { createServiceToken } from "./create";
import { listServiceTokens } from "./list";
import { revokeServiceToken } from "./revoke";
import { isServiceToken } from "../utils/isServiceToken";

export const ServiceTokenService = {
    create: createServiceToken,
    list: listServiceTokens,
    revoke: revokeServiceToken,
    authenticate: authenticateServiceToken,
    isServiceToken,
};
