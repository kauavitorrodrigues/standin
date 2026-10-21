// Whether the text is one word that is an http or https link. A link is exempt
// from the length limit of a nearby message, and the protocol is checked so a
// `javascript:` or `data:` link never counts.
export const isOnlyUrl = (text: string): boolean => {
    const value = text.trim();
    if (value === "" || /\s/.test(value)) return false;

    try {
        const url = new URL(value);
        const isWeb = url.protocol === "http:" || url.protocol === "https:";
        return isWeb && url.hostname !== "";
    } catch {
        return false;
    }
};
