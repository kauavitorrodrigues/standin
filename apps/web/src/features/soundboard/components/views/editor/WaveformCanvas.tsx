import type { RefObject } from "react";
import {
    SOUNDBOARD_WAVEFORM_CANVAS_WIDTH,
    SOUNDBOARD_WAVEFORM_HEIGHT_PX,
} from "../../../consts/waveform";

type Props = { canvasRef: RefObject<HTMLCanvasElement | null> };

export const WaveformCanvas = ({ canvasRef }: Props) => (
    <canvas
        ref={canvasRef}
        width={SOUNDBOARD_WAVEFORM_CANVAS_WIDTH}
        height={SOUNDBOARD_WAVEFORM_HEIGHT_PX}
        className="absolute inset-0 size-full text-muted-foreground"
        aria-hidden
    />
);
