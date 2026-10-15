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
    { label: string; description: string; icon: LucideIcon }
> = {
    [SPRITE_TOOLS.RECT]: {
        label: "Retângulo",
        description: "Arraste para marcar ou preencher um bloco.",
        icon: SquareDashedIcon,
    },
    [SPRITE_TOOLS.BRUSH]: {
        label: "Pincel",
        description:
            "Ocupa tiles da pegada ou pinta células da colisão, clicando ou arrastando.",
        icon: BrushIcon,
    },
    [SPRITE_TOOLS.ERASE]: {
        label: "Borracha",
        description:
            "Apaga na camada em edição: o recorte, os tiles da pegada ou as células da colisão.",
        icon: EraserIcon,
    },
    [SPRITE_TOOLS.BUCKET]: {
        label: "Balde",
        description: "Preenche toda a área contínua da célula clicada.",
        icon: PaintBucketIcon,
    },
};
