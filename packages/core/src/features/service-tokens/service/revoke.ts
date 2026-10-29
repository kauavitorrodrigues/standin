import {
    ServiceTokenNotFoundError,
    type ServiceToken,
} from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";

// Revoking twice is fine: the first revocation date is kept.
export const revokeServiceToken = async (id: string): Promise<ServiceToken> => {
    const current = await ServiceTokenRepository.findById(id);
    if (!current) throw new ServiceTokenNotFoundError();
    if (current.revokedAt) return current;

    const revoked = await ServiceTokenRepository.revoke(id, new Date());
    if (!revoked) throw new ServiceTokenNotFoundError();
    return revoked;
};
