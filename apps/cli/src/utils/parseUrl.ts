// The URL, or undefined when the text is not one.
export const parseUrl = (raw: string): URL | undefined => {
    try {
        return new URL(raw);
    } catch {
        return undefined;
    }
};
