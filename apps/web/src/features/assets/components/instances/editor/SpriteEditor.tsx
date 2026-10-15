import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useObjectUrl } from "../../../hooks/useObjectUrl";
import { useSpriteEditor } from "../../../hooks/useSpriteEditor";
import { useImageSize } from "../../../queries/useImageSize";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getFrameCrop, hasCrop } from "../../../utils/spriteGeometry";
import { EditorCanvas } from "../../views/editor/EditorCanvas";
import { EditorFrameWarning } from "../../views/editor/EditorFrameWarning";
import { EditorHint } from "../../views/editor/EditorHint";
import { EditorToolbar } from "../../views/editor/EditorToolbar";
import { SpriteEditorLeading } from "../../views/editor/SpriteEditorLeading";

type Props = {
    file: File;
    crop: Crop;
    frameCount: number;
    footprint: Footprint;
    // Whether the footprint blocks the way, which changes how it is drawn.
    solid: boolean;
    disabled?: boolean;
    onMarkCrop?: (crop: Crop, footprint: Footprint) => void;
    onMarkFootprint: (footprint: Footprint) => void;
    // Left out when the crop is fixed to the whole image.
    onClear?: () => void;
    footprintOnly?: boolean;
    // Replaces the chips on the left of the toolbar, like the tabs of a dialog
    // that holds more than one editor.
    leading?: ReactNode;
    // Stretches the canvas to the height of the column that holds the editor.
    fill?: boolean;
    onRemoveImage: () => void;
};

// The uploaded image with its toolbar: drag to mark the crop and the
// footprint, zoom in, clear the marks or drop the image.
export const SpriteEditor = ({
    file,
    crop,
    frameCount,
    footprint,
    solid,
    disabled = false,
    onMarkCrop,
    onMarkFootprint,
    onClear,
    footprintOnly = false,
    leading,
    fill = false,
    onRemoveImage,
}: Props) => {
    const url = useObjectUrl(file);
    const { data: size } = useImageSize(file);
    const editor = useSpriteEditor({
        size,
        crop,
        frameCount,
        onMarkCrop,
        onMarkFootprint,
        footprintOnly,
    });

    const handleClear = () => {
        if (!onClear) return;
        onClear();
        editor.setMode("crop");
    };

    return (
        <div className={cn("flex flex-col gap-3", fill && "h-full")}>
            <EditorToolbar
                leading={
                    <SpriteEditorLeading
                        custom={leading}
                        crop={crop}
                        footprint={footprint}
                        solid={solid}
                        mode={editor.mode}
                        footprintOnly={footprintOnly}
                        onModeChange={editor.setMode}
                    />
                }
                zoom={editor.zoom}
                showClear={onClear !== undefined}
                canClear={hasCrop(crop)}
                disabled={disabled}
                onZoomChange={editor.setZoom}
                onClear={handleClear}
                onRemoveImage={onRemoveImage}
            />
            <EditorCanvas
                url={url}
                size={size}
                zoom={editor.zoom}
                crop={crop}
                frame={getFrameCrop(crop, frameCount)}
                footprint={footprint}
                solid={solid}
                className={cn(fill && "flex-1")}
                pointerHandlers={editor.pointerHandlers}
            />
            <EditorFrameWarning crop={crop} frameCount={frameCount} />
            <EditorHint
                mode={editor.mode}
                hasCrop={hasCrop(crop)}
                isStrip={frameCount > 1 && hasCrop(crop)}
            />
        </div>
    );
};
