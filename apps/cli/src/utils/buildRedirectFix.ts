const GENERIC_FIX: string = "Use the final URL of the API as --url.";

// Says where the redirect pointed when the server told.
export const buildRedirectFix = (destination: string | undefined): string => {
    if (!destination) return GENERIC_FIX;
    return `${GENERIC_FIX} The server pointed at ${destination}.`;
};
