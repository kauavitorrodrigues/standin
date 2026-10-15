import {
    BrushIcon,
    EraserIcon,
    PaintBucketIcon,
    SquareDashedIcon,
    type LucideIcon,
} from "lucide-react";
import { SPRITE_TOOLS, type SpriteTool } from "./spriteTools";

// The buttons of the tools, shown the way the toolbars of the other editors
// show theirs: the name and what it does go in the tooltip.
export const SPRITE_TOOL_META: Record<
    SpriteTool,
    {
        label: string;
        description: string;
        icon: LucideIcon;
        // The key that switches to the tool, as shown to the user.
        shortcut: string;
    }
> = {
    [SPRITE_TOOLS.RECT]: {
        label: "Retângulo",
        description: "Arraste para marcar ou preencher um bloco.",
        icon: SquareDashedIcon,
        shortcut: "R",
    },
    [SPRITE_TOOLS.BRUSH]: {
        label: "Pincel",
        description:
            "Pinta células da pegada ou da colisão, clicando ou arrastando.",
        icon: BrushIcon,
        shortcut: "P",
    },
    [SPRITE_TOOLS.ERASE]: {
        label: "Borracha",
        description:
            "Apaga na camada em edição: o recorte ou as células da pegada ou da colisão.",
        icon: EraserIcon,
        shortcut: "E",
    },
    [SPRITE_TOOLS.BUCKET]: {
        label: "Balde",
        description: "Preenche toda a área contínua da célula clicada.",
        icon: PaintBucketIcon,
        shortcut: "G",
    },
};
