import type { PresenceTarget } from "../types/presenceTarget";

// The editor of a space map keeps the user present in the space room. Without
// a space or a signed-in user there is nothing to join, so no connection is
// opened.
export const shouldConnectPresence = (target: PresenceTarget): boolean =>
    Boolean(target.organizationId && target.spaceId && target.userId);
