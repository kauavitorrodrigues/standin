import {
    CropIcon,
    FootprintsIcon,
    Grid3x3Icon,
    type LucideIcon,
} from "lucide-react";
import { TILE_SIZE } from "@standin/contracts";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import {
    COLLISION_COLOR,
    CROP_COLOR,
    FOOTPRINT_COLOR,
} from "../../../consts/editorColors";
import { EDITOR_MODES, type EditorMode } from "../../../consts/editorModes";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { hasCrop } from "../../../utils/spriteGeometry";

type Props = {
    crop: Crop;
    footprint: Footprint;
    mode: EditorMode;
    // Only the footprint is marked, so there is no crop layer.
    footprintOnly: boolean;
    // Why the collision layer cannot be used, null when it can.
    collisionBlocker: string | null;
    onModeChange: (mode: EditorMode) => void;
};

type Layer = {
    layer: EditorMode;
    label: string;
    icon: LucideIcon;
    color: string;
    description: string | undefined;
    // Why the layer cannot be used, null when it can.
    blocker: string | null;
};

const getSizeText = (marked: boolean, width: number, height: number) => {
    if (!marked) return undefined;
    return `${width} x ${height} tiles`;
};

const getFootprintBlocker = (crop: Crop) => {
    if (hasCrop(crop)) return null;
    return "Marque o recorte antes da pegada.";
};

const getLayers = ({
    crop,
    footprint,
    footprintOnly,
    collisionBlocker,
}: Pick<
    Props,
    "crop" | "footprint" | "footprintOnly" | "collisionBlocker"
>): Layer[] => {
    const marked = hasCrop(crop);
    const layers: Layer[] = [
        {
            layer: EDITOR_MODES.CROP,
            label: "Recorte",
            icon: CropIcon,
            color: CROP_COLOR,
            description: getSizeText(
                marked,
                crop.w / TILE_SIZE,
                crop.h / TILE_SIZE
            ),
            blocker: null,
        },
        {
            layer: EDITOR_MODES.FOOTPRINT,
            label: "Pegada",
            icon: FootprintsIcon,
            color: FOOTPRINT_COLOR,
            description: getSizeText(marked, footprint.w, footprint.h),
            blocker: getFootprintBlocker(crop),
        },
        {
            layer: EDITOR_MODES.COLLISION,
            label: "Colisão",
            icon: Grid3x3Icon,
            color: COLLISION_COLOR,
            description: "Onde a peça bloqueia a passagem, célula a célula.",
            blocker: collisionBlocker,
        },
    ];
    return layers.filter(
        (item) => !(footprintOnly && item.layer === EDITOR_MODES.CROP)
    );
};

// The layers over the image, at the top of the toolbar on the right, so the
// pointer does not have to travel to switch the layer and then pick its tool.
// The button of a layer has its color on the canvas and switches to editing
// it. The others stay drawn, paler.
export const LayersSection = ({ mode, onModeChange, ...layers }: Props) => (
    <div className="flex flex-col gap-1">
        {getLayers(layers).map(
            ({ layer, label, icon, color, description, blocker }) => (
                // The reason a layer is off shows on hover even though a
                // disabled button takes no pointer.
                <span key={layer} title={blocker ?? undefined}>
                    <ToolbarButton
                        label={label}
                        description={description}
                        icon={icon}
                        color={color}
                        active={mode === layer}
                        disabled={blocker !== null}
                        onClick={() => onModeChange(layer)}
                    />
                </span>
            )
        )}
    </div>
);
