import type { ReactNode } from "react";
import { BrushCleaningIcon, CircleHelpIcon, Trash2Icon } from "lucide-react";
import { ToolbarDivider } from "@/features/editor/components/layout/ToolbarDivider";
import { VerticalToolbar } from "@/features/editor/components/layout/VerticalToolbar";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { SPRITE_TOOL_META } from "../../../consts/spriteToolMeta";
import { SPRITE_TOOLS, type SpriteTool } from "../../../consts/spriteTools";

const ALL_TOOLS: SpriteTool[] = [
    SPRITE_TOOLS.RECT,
    SPRITE_TOOLS.BRUSH,
    SPRITE_TOOLS.BUCKET,
    SPRITE_TOOLS.ERASE,
];

type Props = {
    // The layers, at the top of the toolbar.
    layers: ReactNode;
    // The tools the layer being edited has. The others stay in the toolbar,
    // off.
    available: SpriteTool[];
    tool: SpriteTool;
    // Whether the editor can clear its marks at all, and whether there is
    // anything marked to clear now.
    showClear: boolean;
    canClear: boolean;
    disabled: boolean;
    onToolChange: (tool: SpriteTool) => void;
    onClear: () => void;
    onRemoveImage: () => void;
    onHelp: () => void;
};

// Everything the user acts with, floating on the right of the image like the
// toolbar of the map editor: the tools (always all of them, off where the
// layer does not have one), then clearing the marks, dropping the image and
// the help.
export const SpriteToolbar = ({
    layers,
    available,
    tool,
    showClear,
    canClear,
    disabled,
    onToolChange,
    onClear,
    onRemoveImage,
    onHelp,
}: Props) => (
    <VerticalToolbar>
        {layers}
        <ToolbarDivider />
        {ALL_TOOLS.map((value) => (
            <ToolbarButton
                key={value}
                {...SPRITE_TOOL_META[value]}
                active={value === tool}
                disabled={!available.includes(value)}
                onClick={() => onToolChange(value)}
            />
        ))}
        <ToolbarDivider />
        <ToolbarButton
            label="Limpar recorte e pegada"
            icon={BrushCleaningIcon}
            disabled={!showClear || !canClear || disabled}
            onClick={onClear}
        />
        <ToolbarButton
            label="Remover imagem"
            icon={Trash2Icon}
            disabled={disabled}
            onClick={onRemoveImage}
        />
        <ToolbarDivider />
        <ToolbarButton
            label="O que são recorte, pegada e colisão?"
            icon={CircleHelpIcon}
            onClick={onHelp}
        />
    </VerticalToolbar>
);
