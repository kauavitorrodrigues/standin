// The link as the line shows it: the host without `www.` and the path. Null
// when the text is not a link that can be read.
export const formatNearbyLink = (text: string): string | null => {
    try {
        const url = new URL(text);
        const host = url.hostname.replace(/^www\./, "");
        const path = url.pathname === "/" ? "" : url.pathname;
        return `${host}${path}${url.search}`;
    } catch {
        return null;
    }
};
