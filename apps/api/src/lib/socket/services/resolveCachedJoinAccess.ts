import { JoinAccessCache } from "./joinAccessCache";
import { resolveJoinAccess, type JoinAccess } from "./resolveJoinAccess";

// `resolveJoinAccess` behind the short cache of the socket server.
export const resolveCachedJoinAccess = async (
    userId: string,
    spaceId: string
): Promise<JoinAccess | null> => {
    const cached = JoinAccessCache.get(userId, spaceId);
    if (cached) return cached;

    const access = await resolveJoinAccess(userId, spaceId);
    if (access) JoinAccessCache.set(userId, spaceId, access);
    return access;
};
