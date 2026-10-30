import type { PointerEvent } from "react";
import { TRIM_EDGES } from "../../../consts/trim";
import type { HandleKeyEvent, TrimEdge, TrimRange } from "../../../types/trim";
import { TrimHandle } from "./TrimHandle";

type Props = {
    range: TrimRange;
    durationMs: number;
    onStartDrag: (edge: TrimEdge, event: PointerEvent) => void;
    onNudge: (edge: TrimEdge, event: HandleKeyEvent) => void;
};

export const TrimHandles = ({
    range,
    durationMs,
    onStartDrag,
    onNudge,
}: Props) => (
    <>
        {TRIM_EDGES.map((config) => (
            <TrimHandle
                key={config.edge}
                config={config}
                valueMs={range[config.edge]}
                durationMs={durationMs}
                onPointerDown={(event) => onStartDrag(config.edge, event)}
                onKeyDown={(event) => onNudge(config.edge, event)}
            />
        ))}
    </>
);
