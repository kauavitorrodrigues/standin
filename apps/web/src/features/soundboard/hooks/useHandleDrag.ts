import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { moveEdge } from "../lib/moveEdge";
import { getHandleStep } from "../utils/getHandleStep";
import type {
    HandleDragOptions,
    HandleKeyEvent,
    TrimEdge,
} from "../types/trim";

/**
 * Drags one handle of the selection. Listens on the window while a handle is
 * held, so the drag keeps working when the pointer leaves the waveform.
 */
export function useHandleDrag({
    durationMs,
    range,
    onChange,
}: HandleDragOptions) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [edge, setEdge] = useState<TrimEdge | null>(null);
    const latest = useRef({ durationMs, range, onChange });

    useEffect(() => {
        latest.current = { durationMs, range, onChange };
    });

    useEffect(() => {
        if (!edge) return;

        const move = (event: globalThis.PointerEvent) => {
            const box = containerRef.current?.getBoundingClientRect();
            if (!box) return;
            const ratio = (event.clientX - box.left) / box.width;
            const current = latest.current;
            const ms = Math.min(Math.max(ratio, 0), 1) * current.durationMs;
            current.onChange(moveEdge(edge, ms, current.range));
        };
        const end = () => setEdge(null);

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);
        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", end);
        };
    }, [edge]);

    const startDrag = useCallback((next: TrimEdge, event: PointerEvent) => {
        event.preventDefault();
        setEdge(next);
    }, []);

    // The arrow keys move the focused handle, since there are no number
    // fields to cut with.
    const nudge = useCallback((edge: TrimEdge, event: HandleKeyEvent) => {
        const step = getHandleStep(event.key, event.shiftKey);
        if (step === null) return;
        event.preventDefault();
        const current = latest.current;
        current.onChange(
            moveEdge(edge, current.range[edge] + step, current.range)
        );
    }, []);

    return { containerRef, startDrag, nudge };
}
