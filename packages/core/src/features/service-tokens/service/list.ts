import type { ServiceToken } from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";

export const listServiceTokens = (): Promise<ServiceToken[]> =>
    ServiceTokenRepository.list();
