import type { Request } from "express";
import { SpotifyStateInvalidError } from "@standin/contracts";
import type { User } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import { authenticateFromRequest } from "@/features/auth/services/authenticateFromRequest";
import type { SpotifyStateCookie } from "../types";

// Whether the session is the person who started the attempt.
const isAttemptOf = (
    user: User | false,
    attempt: SpotifyStateCookie
): boolean => {
    if (!user) return false;

    return user.id === attempt.userId;
};

/**
 * The cookie must belong to the person who comes back, and they must still be
 * a member of the organization. A missing session counts too: the person gets
 * a message instead of a bare 401.
 */
export const assertValidAttempt = async (
    req: Request,
    attempt: SpotifyStateCookie
): Promise<void> => {
    const user = await authenticateFromRequest(req);
    if (!isAttemptOf(user, attempt)) throw new SpotifyStateInvalidError();

    const membership = await OrganizationService.findMembership(
        attempt.userId,
        attempt.organizationId
    );
    if (!membership) throw new SpotifyStateInvalidError();
};
