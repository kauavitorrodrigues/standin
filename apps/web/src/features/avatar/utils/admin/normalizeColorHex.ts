// The hex of a color as the API takes it: trimmed and in upper case.
export const normalizeColorHex = (hex: string): string =>
    hex.trim().toUpperCase();
