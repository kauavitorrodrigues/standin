import { authenticateServiceToken } from "./authenticate";
import { createServiceToken } from "./create";
import { listServiceTokens } from "./list";
import { regenerateServiceToken } from "./regenerate";
import { removeServiceToken } from "./remove";
import { revokeServiceToken } from "./revoke";
import { isServiceToken } from "../utils/isServiceToken";

export const ServiceTokenService = {
    create: createServiceToken,
    list: listServiceTokens,
    regenerate: regenerateServiceToken,
    remove: removeServiceToken,
    revoke: revokeServiceToken,
    authenticate: authenticateServiceToken,
    isServiceToken,
};
