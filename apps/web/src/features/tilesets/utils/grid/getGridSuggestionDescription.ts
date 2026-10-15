import type { GridSuggestion } from "../../types/sheet";

// What sets a division apart, said short: no margin and no spacing, or how
// many px of each.
export const getGridSuggestionDescription = ({
    margin,
    spacing,
}: GridSuggestion): string => {
    if (margin === 0 && spacing === 0) return "Sem margem nem espaçamento";
    return `Margem ${margin} px · espaço ${spacing} px`;
};
