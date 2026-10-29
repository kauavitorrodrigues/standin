import { TOKEN_PREFIX_LENGTH } from "../consts";

export const getTokenPrefix = (token: string): string =>
    token.slice(0, TOKEN_PREFIX_LENGTH);
