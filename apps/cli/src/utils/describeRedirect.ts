// Where a redirect points, without the query (it may carry a secret). A
// relative location is resolved against the URL that was asked.
export const describeRedirect = (
    location: string | undefined,
    asked: string
): string | undefined => {
    if (!location) return undefined;
    try {
        const destination: URL = new URL(location, asked);
        return `${destination.origin}${destination.pathname}`;
    } catch {
        return undefined;
    }
};
