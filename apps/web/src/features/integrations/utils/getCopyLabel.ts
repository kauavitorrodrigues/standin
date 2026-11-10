/** The label of a copy button: it says "copied" for a moment after the click. */
export const getCopyLabel = (copied: boolean): string => {
    if (copied) return "Copiado";

    return "Copiar";
};
