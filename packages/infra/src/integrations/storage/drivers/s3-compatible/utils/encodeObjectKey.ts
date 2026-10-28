// Encodes each segment on its own so the "/" separators stay literal.
export const encodeObjectKey = (key: string): string =>
    key.split("/").map(encodeURIComponent).join("/");
