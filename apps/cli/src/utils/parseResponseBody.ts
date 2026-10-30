// The body as JSON; undefined when there is none or it is not JSON (a proxy
// error page).
export const parseResponseBody = (text: string): unknown => {
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
};
