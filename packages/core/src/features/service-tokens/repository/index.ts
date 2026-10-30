import { createServiceToken } from "./create";
import { findServiceTokenByHash } from "./findByHash";
import { findServiceTokenById } from "./findById";
import { listServiceTokens } from "./list";
import { regenerateServiceToken } from "./regenerate";
import { removeServiceToken } from "./remove";
import { revokeServiceToken } from "./revoke";
import { touchServiceTokenLastUsed } from "./touchLastUsed";

export const ServiceTokenRepository = {
    create: createServiceToken,
    findByHash: findServiceTokenByHash,
    findById: findServiceTokenById,
    list: listServiceTokens,
    regenerate: regenerateServiceToken,
    remove: removeServiceToken,
    revoke: revokeServiceToken,
    touchLastUsed: touchServiceTokenLastUsed,
};
