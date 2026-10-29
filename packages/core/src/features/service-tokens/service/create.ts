import type { CreatedServiceToken } from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";
import type { CreateServiceTokenInput } from "../types";
import { dedupeScopes } from "../utils/dedupeScopes";
import { generateToken } from "../utils/generateToken";
import { getTokenPrefix } from "../utils/getTokenPrefix";
import { hashToken } from "../utils/hashToken";

// The clear token only exists here and in the answer. What is stored is its
// hash and a short prefix.
export const createServiceToken = async (
    createdById: string,
    input: CreateServiceTokenInput
): Promise<CreatedServiceToken> => {
    const token = generateToken();

    const serviceToken = await ServiceTokenRepository.create({
        createdById,
        name: input.name,
        scopes: dedupeScopes(input.scopes),
        expiresAt: input.expiresAt,
        tokenHash: hashToken(token),
        tokenPrefix: getTokenPrefix(token),
    });

    return { token, serviceToken };
};
