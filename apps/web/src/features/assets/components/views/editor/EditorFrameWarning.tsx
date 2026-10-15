import { TriangleAlertIcon } from "lucide-react";
import { TILE_SIZE } from "@standin/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Crop } from "../../../types/spriteGeometry";
import { hasCrop, splitsIntoFrames } from "../../../utils/spriteGeometry";

type Props = {
    crop: Crop;
    frameCount: number;
};

// The crop is a strip of frames, but it does not split into frames of whole
// tiles, so the footprint cannot be marked on a frame. Nothing is said while
// there is no crop, or while it splits. It floats over the top of the editor
// area, under the tabs that switch the editor.
export const EditorFrameWarning = ({ crop, frameCount }: Props) => {
    if (!hasCrop(crop) || splitsIntoFrames(crop, frameCount)) return null;

    return (
        <Alert
            variant="destructive"
            className="absolute bg-card border-none top-16 left-1/2 z-10 w-fit max-w-sm -translate-x-1/2 py-2 text-xs"
        >
            <TriangleAlertIcon />
            <AlertDescription>
                {crop.w / TILE_SIZE} tiles de largura não dividem em{" "}
                {frameCount} frames de tiles inteiros. Ajuste o recorte ou o
                número de frames.
            </AlertDescription>
        </Alert>
    );
};
