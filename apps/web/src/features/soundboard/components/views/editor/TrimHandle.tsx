import type { KeyboardEvent, PointerEvent } from "react";
import type { TrimEdgeConfig } from "../../../types/trim";
import { percentOf } from "@/utils/percentOf";

type Props = {
    config: TrimEdgeConfig;
    valueMs: number;
    durationMs: number;
    onPointerDown: (event: PointerEvent) => void;
    onKeyDown: (event: KeyboardEvent) => void;
};

// One draggable edge of the selection.
export const TrimHandle = ({
    config,
    valueMs,
    durationMs,
    onPointerDown,
    onKeyDown,
}: Props) => (
    <button
        type="button"
        role="slider"
        aria-label={config.handleLabel}
        aria-valuemin={0}
        aria-valuemax={Math.round(durationMs)}
        aria-valuenow={Math.round(valueMs)}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 -ml-1.5 w-3 cursor-ew-resize outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-foreground before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-5 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:border before:bg-background focus-visible:before:ring-2 focus-visible:before:ring-ring"
        style={{ left: percentOf(valueMs, durationMs) }}
    />
);
