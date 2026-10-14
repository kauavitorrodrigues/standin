import type { Cell, EditorOp, PublishIssue } from "@standin/contracts";
import { getLayerLabel } from "@/features/maps/__shared__/utils/getLayerLabel";

const describeOp = (op: EditorOp | undefined): string => {
    if (!op) return "Alteração";

    switch (op.type) {
        case "paint":
            return `Pintura em ${getLayerLabel(op.layer)}`;
        case "erase":
            return `Borracha em ${getLayerLabel(op.layer)}`;
        case "place_asset":
            return "Objeto colocado";
        case "move_asset":
            return "Objeto movido";
        case "replace_asset":
            return "Objeto trocado";
        case "remove_asset":
            return "Objeto apagado";
        case "set_zone":
            return "Zona";
        case "remove_zone":
            return "Zona removida";
        case "set_background":
            return "Cor de fundo";
    }
};

// One sentence for an error of the publish: which operation, where, and what
// the server said. The place is left out when the operation has none.
export const describePublishIssue = (
    issue: PublishIssue,
    op: EditorOp | undefined,
    cell: Cell | null
): string => {
    const where = cell ? ` na célula (${cell[0]}, ${cell[1]})` : "";
    return `${describeOp(op)}${where}: ${issue.message}`;
};
