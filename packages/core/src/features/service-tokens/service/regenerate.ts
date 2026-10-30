import {
    ServiceTokenNotActiveError,
    ServiceTokenNotFoundError,
    type CreatedServiceToken,
} from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";
import { generateToken } from "../utils/generateToken";
import { getTokenPrefix } from "../utils/getTokenPrefix";
import { hashToken } from "../utils/hashToken";
import { isTokenExpired } from "../utils/isTokenExpired";

// Gives an active token a new secret. Tokens are looked up by hash on every
// request and no cache holds them, so the old secret stops working as soon as
// the row changes.
export const regenerateServiceToken = async (
    id: string
): Promise<CreatedServiceToken> => {
    const current = await ServiceTokenRepository.findById(id);
    if (!current) throw new ServiceTokenNotFoundError();

    const now = new Date();
    if (current.revokedAt || isTokenExpired(current.expiresAt, now)) {
        throw new ServiceTokenNotActiveError();
    }

    const token = generateToken();
    const serviceToken = await ServiceTokenRepository.regenerate(id, {
        tokenHash: hashToken(token),
        tokenPrefix: getTokenPrefix(token),
        now,
    });
    if (!serviceToken) throw new ServiceTokenNotActiveError();

    return { token, serviceToken };
};
