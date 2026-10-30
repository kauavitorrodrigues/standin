import type { TrimRange } from "../../../types/trim";
import { percentOf } from "@/utils/percentOf";

type Props = { range: TrimRange; durationMs: number };

// The part of the waveform that will be kept.
export const SelectionOverlay = ({ range, durationMs }: Props) => (
    <div
        className="absolute inset-y-0 bg-primary/20"
        style={{
            left: percentOf(range.startMs, durationMs),
            width: percentOf(range.endMs - range.startMs, durationMs),
        }}
    />
);
