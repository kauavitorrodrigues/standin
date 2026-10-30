import { useMemo } from "react";
import { SOUNDBOARD_WAVEFORM_BUCKETS } from "../../../consts/waveform";
import { useHandleDrag } from "../../../hooks/useHandleDrag";
import { useWaveformCanvas } from "../../../hooks/useWaveformCanvas";
import { computePeaks } from "../../../lib/computePeaks";
import type { DecodedSource } from "../../../types/audio";
import type { TrimRange } from "../../../types/trim";
import { Playhead } from "../../views/editor/Playhead";
import { SelectionOverlay } from "../../views/editor/SelectionOverlay";
import { TrimHandles } from "../../views/editor/TrimHandles";
import { WaveformCanvas } from "../../views/editor/WaveformCanvas";
import { WaveformFrame } from "../../views/editor/WaveformFrame";

type Props = {
    source: DecodedSource;
    range: TrimRange;
    playheadMs: number | null;
    onChange: (range: TrimRange) => void;
};

// The waveform of the file with the two handles that bound the selection.
export const EditorWaveform = ({
    source,
    range,
    playheadMs,
    onChange,
}: Props) => {
    const peaks = useMemo(
        () => computePeaks(source.channels, SOUNDBOARD_WAVEFORM_BUCKETS),
        [source]
    );
    const canvasRef = useWaveformCanvas(peaks);
    const { containerRef, startDrag, nudge } = useHandleDrag({
        durationMs: source.durationMs,
        range,
        onChange,
    });

    return (
        <WaveformFrame containerRef={containerRef}>
            <WaveformCanvas canvasRef={canvasRef} />
            <SelectionOverlay range={range} durationMs={source.durationMs} />
            <Playhead playheadMs={playheadMs} durationMs={source.durationMs} />
            <TrimHandles
                range={range}
                durationMs={source.durationMs}
                onStartDrag={startDrag}
                onNudge={nudge}
            />
        </WaveformFrame>
    );
};
