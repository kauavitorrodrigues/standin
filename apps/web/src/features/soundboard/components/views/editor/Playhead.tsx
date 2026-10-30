import { percentOf } from "@/utils/percentOf";

type Props = { playheadMs: number | null; durationMs: number };

// The position of the playback, while the selection plays.
export const Playhead = ({ playheadMs, durationMs }: Props) => {
    if (playheadMs === null) return null;

    return (
        <div
            className="absolute inset-y-0 w-px bg-foreground"
            style={{ left: percentOf(playheadMs, durationMs) }}
        />
    );
};
