/**
 * Where the browser goes after the callback: the web root, which sends a
 * signed in person on to the app. With an error code the root is the login
 * page, which reads `?error=`. Uses `FRONTEND_URL`, the same origin the CORS
 * setting trusts.
 */
export const buildWebRedirectUrl = (errorCode?: string): string => {
    const url = new URL(process.env.FRONTEND_URL as string);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    url.search = "";
    if (errorCode) url.searchParams.set("error", errorCode);

    return url.toString();
};
