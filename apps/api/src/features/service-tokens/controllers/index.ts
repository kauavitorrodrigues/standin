import { createServiceToken } from "./create";
import { listServiceTokens } from "./list";
import { revokeServiceToken } from "./revoke";

export const ServiceTokenController = {
    create: createServiceToken,
    list: listServiceTokens,
    revoke: revokeServiceToken,
};
