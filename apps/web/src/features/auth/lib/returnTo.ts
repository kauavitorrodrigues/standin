import {
    RETURN_PATH_IGNORED,
    RETURN_PATH_STORAGE_KEY,
} from "../consts/returnTo";

/**
 * Only a path of this app is worth going back to. An address with a host, or
 * one that starts with two slashes, would send the person to another site
 * after the login.
 */
export const isReturnablePath = (path: string): boolean => {
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//") || path.startsWith("/\\")) return false;

    const pathname = path.split(/[?#]/)[0];
    return !RETURN_PATH_IGNORED.some((ignored) => ignored === pathname);
};

// The browser can refuse storage (private window, blocked site data), and the
// person then simply lands on the home after the login.
export const rememberReturnPath = (path: string): void => {
    if (!isReturnablePath(path)) return;

    try {
        sessionStorage.setItem(RETURN_PATH_STORAGE_KEY, path);
    } catch {
        // nothing to do without storage
    }
};

/** The page the person was going to before the login, taken once. */
export const takeReturnPath = (): string | null => {
    try {
        const path = sessionStorage.getItem(RETURN_PATH_STORAGE_KEY);
        sessionStorage.removeItem(RETURN_PATH_STORAGE_KEY);
        if (!path || !isReturnablePath(path)) return null;

        return path;
    } catch {
        return null;
    }
};
