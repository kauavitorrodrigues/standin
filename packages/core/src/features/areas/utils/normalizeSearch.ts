/** Lower case and no accents, so "cafe" finds "Café". */
export const normalizeSearch = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
