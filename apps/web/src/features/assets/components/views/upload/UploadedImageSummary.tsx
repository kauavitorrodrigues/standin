import { TILE_SIZE } from "@standin/contracts";
import { useImageSize } from "@/features/assets/queries/useImageSize";
import { getFrameSize } from "@/features/assets/utils/getFrameSize";

type Props = {
    file: File;
    // 1 for a static asset, the number of frames of the strip otherwise.
    frameCount: number;
};

// What the server will read from the PNG: its size and, from it, the size of
// one frame, which becomes the sprite size of the asset.
export const UploadedImageSummary = ({ file, frameCount }: Props) => {
    const { data: size } = useImageSize(file);
    if (!size) return null;

    return (
        <div className="bg-muted/30 flex flex-col gap-1 rounded-lg border p-3 text-sm">
            <p>
                Imagem: {size.w} × {size.h} px
            </p>
            <FrameSizeLine
                frame={getFrameSize(size, frameCount)}
                frameCount={frameCount}
            />
        </div>
    );
};

type LineProps = {
    // Null when the width does not divide into the frames of the strip.
    frame: { w: number; h: number } | null;
    frameCount: number;
};

const FrameSizeLine = ({ frame, frameCount }: LineProps) => {
    if (!frame) {
        return (
            <p className="text-destructive">
                A largura não divide em {frameCount} frames iguais.
            </p>
        );
    }
    return (
        <p>
            Frame: {frame.w} × {frame.h} px ({frame.w / TILE_SIZE} ×{" "}
            {frame.h / TILE_SIZE} células)
        </p>
    );
};
