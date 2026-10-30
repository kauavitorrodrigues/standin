const SCOPE_IN_MESSAGE: RegExp = /"([a-z]+:[a-z]+)"/;

// The scope the server names in its message, such as maps:read.
export const extractMissingScope = (message: string): string | undefined =>
    SCOPE_IN_MESSAGE.exec(message)?.[1];
