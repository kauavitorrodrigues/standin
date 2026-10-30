import type { ServiceTokenActions, ServiceTokenStatus } from "../types";

// What an admin may do to a token in each state. A token that no longer
// works cannot be revoked or regenerated, but any token can be deleted.
const ACTIONS_BY_STATUS: Record<ServiceTokenStatus, ServiceTokenActions> = {
    active: { canRegenerate: true, canRevoke: true, canDelete: true },
    expired: { canRegenerate: false, canRevoke: false, canDelete: true },
    revoked: { canRegenerate: false, canRevoke: false, canDelete: true },
};

export const getTokenActions = (
    status: ServiceTokenStatus
): ServiceTokenActions => ACTIONS_BY_STATUS[status];
