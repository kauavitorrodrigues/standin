import { SERVICE_TOKEN_PREFIX } from "@standin/contracts";

export const isServiceToken = (token: string): boolean =>
    token.startsWith(SERVICE_TOKEN_PREFIX);
