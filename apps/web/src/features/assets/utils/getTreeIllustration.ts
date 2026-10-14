import { TREE_DIMMED_OPACITY } from "../consts/treeIllustration";

export type TreeHighlight = "crop" | "footprint" | "collision";

// What a screen reader says about the drawing.
export const getTreeAriaLabel = (highlight: TreeHighlight): string => {
    switch (highlight) {
        case "crop":
            return "Uma árvore inteira dentro do retângulo azul do recorte";
        case "footprint":
            return "Só a base do tronco dentro do retângulo vermelho da pegada";
        case "collision":
            return "Só as células do tronco pintadas de vermelho, dentro da pegada";
    }
};

// The tree is paler while the footprint or the collision is highlighted.
export const getTreeOpacity = (highlight: TreeHighlight): number => {
    switch (highlight) {
        case "footprint":
        case "collision":
            return TREE_DIMMED_OPACITY;
        default:
            return 1;
    }
};
