import type { ReactNode, RefObject } from "react";
import { SOUNDBOARD_WAVEFORM_HEIGHT_PX } from "../../../consts/waveform";

type Props = {
    containerRef: RefObject<HTMLDivElement | null>;
    children: ReactNode;
};

export const WaveformFrame = ({ containerRef, children }: Props) => (
    <div
        ref={containerRef}
        className="relative min-w-0 flex-1 touch-none select-none"
        style={{ height: SOUNDBOARD_WAVEFORM_HEIGHT_PX }}
    >
        {children}
    </div>
);
