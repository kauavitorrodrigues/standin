import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useObjectUrl } from "../../../hooks/useObjectUrl";
import { useSolidDetection } from "../../../hooks/useSolidDetection";
import { useSpriteEditor } from "../../../hooks/useSpriteEditor";
import { useSpriteHotkeys } from "../../../hooks/useSpriteHotkeys";
import { useImageSize } from "../../../queries/useImageSize";
import type {
    FootprintMasks,
    FootprintMaskValue,
    SolidMaskValue,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getCollisionBlocker } from "../../../utils/getCollisionBlocker";
import { getModeTools } from "../../../utils/getModeTools";
import {
    getFrameCrop,
    hasCrop,
    hasFootprint,
} from "../../../utils/spriteGeometry";
import { EditorCanvas } from "../../views/editor/EditorCanvas";
import { EditorFrameWarning } from "../../views/editor/EditorFrameWarning";
import { EditorStage } from "../../views/editor/EditorStage";
import { EditorHelpDialog } from "../../views/editor/EditorHelpDialog";
import { LayersSection } from "../../views/editor/LayersSection";
import { SpriteToolbar } from "../../views/editor/SpriteToolbar";

type Props = {
    file: File;
    crop: Crop;
    frameCount: number;
    footprint: Footprint;
    // The occupied cells of the footprint, null when it is the whole rectangle.
    mask?: FootprintMaskValue;
    // The cells of the footprint that block the player, null when the occupied
    // cells block as a whole.
    solidMask?: SolidMaskValue;
    // Takes the two masks together, since painting a cell can change both.
    // Left out when the editor cannot paint the cells.
    onChangeSolid?: (masks: FootprintMasks) => void;
    // Whether the footprint blocks the way, which changes how it is drawn.
    solid: boolean;
    disabled?: boolean;
    onMarkCrop?: (crop: Crop) => void;
    onMarkFootprint: (footprint: Footprint) => void;
    // Left out when the crop is fixed to the whole image.
    onClear?: () => void;
    footprintOnly?: boolean;
    // Replaces the chips on the left of the toolbar, like the tabs of a dialog
    // that holds more than one editor.
    leading?: ReactNode;
    // Floats at the bottom of the image, like the buttons that close the form.
    actions?: ReactNode;
    // Stretches the canvas to the height of the column that holds the editor.
    fill?: boolean;
    onRemoveImage: () => void;
};

// The uploaded image with its toolbar and the column of layers and tools:
// pick a layer and a tool, then drag over the image to mark the crop and the
// footprint or paint the collision. Zoom in, clear the marks or drop the
// image from the toolbar.
export const SpriteEditor = ({
    file,
    crop,
    frameCount,
    footprint,
    mask = null,
    solidMask = null,
    onChangeSolid,
    solid,
    disabled = false,
    onMarkCrop,
    onMarkFootprint,
    onClear,
    footprintOnly = false,
    leading,
    actions,
    fill = false,
    onRemoveImage,
}: Props) => {
    const url = useObjectUrl(file);
    const { data: size } = useImageSize(file);
    const masks: FootprintMasks = { mask, solidMask };
    const isAnimated = frameCount > 1;
    const collisionBlocker = getCollisionBlocker({
        hasCrop: hasCrop(crop),
        hasFootprint: hasFootprint(footprint),
        isAnimated,
        solid,
        canEdit: onChangeSolid !== undefined,
    });
    const canCollide = collisionBlocker === null;
    // The shape of the art is read for any still asset with a footprint, so
    // the area of a piece that does not block is as thin as its drawing too.
    const canDetect =
        onChangeSolid !== undefined &&
        hasCrop(crop) &&
        hasFootprint(footprint) &&
        !isAnimated;
    const detection = useSolidDetection({
        file,
        frame: getFrameCrop(crop, frameCount),
        footprint,
        enabled: canDetect,
        onChange: onChangeSolid,
    });
    // A cell painted by hand is not replaced by the drawing afterwards.
    const paintSolid = (next: FootprintMasks) => {
        detection.markPainted();
        onChangeSolid?.(next);
    };
    const editor = useSpriteEditor({
        size,
        crop,
        frameCount,
        onMarkCrop,
        onMarkFootprint,
        onEraseCrop: onClear,
        footprint,
        footprintOnly,
        masks,
        onChangeSolid: paintSolid,
        canCollide,
    });
    const availableTools = getModeTools(editor.mode, editor.canPaintCells);
    useSpriteHotkeys({ available: availableTools, onTool: editor.setTool });
    const [helpOpen, setHelpOpen] = useState(false);

    const handleClear = () => {
        if (!onClear) return;
        onClear();
        editor.setMode("crop");
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-3",
                fill && "h-full min-h-0 flex-1"
            )}
        >
            <EditorStage
                zoom={editor.zoom}
                onZoomChange={editor.setZoom}
                leading={leading}
                actions={actions}
                className={cn("min-h-0 flex-1", fill && "max-h-none")}
            >
                <EditorCanvas
                    url={url}
                    size={size}
                    zoom={editor.zoom}
                    crop={crop}
                    frame={getFrameCrop(crop, frameCount)}
                    footprint={footprint}
                    mask={mask}
                    solid={solid}
                    byCells={editor.canPaintCells}
                    mode={editor.mode}
                    collisionAvailable={collisionBlocker === null}
                    solidMask={solidMask}
                    hoveredCell={editor.hoveredCell}
                    className="min-h-0 flex-1"
                    pointerHandlers={editor.pointerHandlers}
                />
                <SpriteToolbar
                    layers={
                        <LayersSection
                            crop={crop}
                            footprint={footprint}
                            mode={editor.mode}
                            footprintOnly={footprintOnly}
                            collisionBlocker={collisionBlocker}
                            onModeChange={editor.setMode}
                        />
                    }
                    available={availableTools}
                    tool={editor.tool}
                    showClear={onClear !== undefined}
                    canClear={hasCrop(crop)}
                    disabled={disabled}
                    onToolChange={editor.setTool}
                    onClear={handleClear}
                    onRemoveImage={onRemoveImage}
                    onHelp={() => setHelpOpen(true)}
                />
            </EditorStage>
            <EditorFrameWarning crop={crop} frameCount={frameCount} />
            <EditorHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
        </div>
    );
};
