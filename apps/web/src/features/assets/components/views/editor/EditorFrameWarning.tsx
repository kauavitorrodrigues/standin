import { TriangleAlertIcon } from "lucide-react";
import { TILE_SIZE } from "@standin/contracts";
import type { Crop } from "../../../types/spriteGeometry";
import { hasCrop, splitsIntoFrames } from "../../../utils/spriteGeometry";

type Props = {
    crop: Crop;
    frameCount: number;
};

// The crop is a strip of frames, but it does not split into frames of whole
// tiles, so the footprint cannot be marked on a frame. Nothing is said while
// there is no crop, or while it splits.
export const EditorFrameWarning = ({ crop, frameCount }: Props) => {
    if (!hasCrop(crop) || splitsIntoFrames(crop, frameCount)) return null;

    return (
        <p className="text-destructive flex items-center gap-2 rounded-lg border border-dashed border-destructive/40 px-3 py-2.5 text-sm">
            <TriangleAlertIcon className="size-3.5 shrink-0" />
            {crop.w / TILE_SIZE} tiles de largura não dividem em {frameCount}{" "}
            frames de tiles inteiros. Ajuste o recorte ou o número de frames.
        </p>
    );
};
