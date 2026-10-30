// The value of a JSON text; undefined when it is not JSON.
export const parseJsonText = (text: string): unknown => {
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
};
