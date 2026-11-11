const DEFAULT_FRONTEND_URL = "http://localhost:5173";

/**
 * Where the web app is served from: the origin the API already trusts for
 * CORS. An embedded website may not point back at it.
 */
export const getAppOrigins = (): string[] => {
    const value = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
    return URL.canParse(value) ? [new URL(value).origin] : [];
};
