import { createServiceToken } from "./create";
import { listServiceTokens } from "./list";
import { regenerateServiceToken } from "./regenerate";
import { removeServiceToken } from "./remove";
import { revokeServiceToken } from "./revoke";

export const ServiceTokenController = {
    create: createServiceToken,
    list: listServiceTokens,
    regenerate: regenerateServiceToken,
    remove: removeServiceToken,
    revoke: revokeServiceToken,
};
