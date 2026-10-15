import { useEffect, useRef, useState, type RefObject } from "react";
import { isSpaceKeyTarget } from "@/utils/isSpaceKeyTarget";
import type { TileTool } from "../../types/sheet";

const MIDDLE_BUTTON = 1;

type Params = {
    scrollRef: RefObject<HTMLDivElement | null>;
    tool: TileTool;
};

type Drag = {
    x: number;
    y: number;
    left: number;
    top: number;
};

// Moves the sheet in its frame by dragging it, instead of the scroll bars. A
// drag pans when it starts outside the sheet (on the area around it), with the
// pan tool, with the space bar held, or with the middle button. It listens on
// the frame before what is under the pointer does, so a pan never also
// selects or paints. `panMode` is for the cursor: the pointer is a hand while
// a drag over the sheet would pan.
export const useTileSheetPan = ({ scrollRef, tool }: Params) => {
    const [spaceHeld, setSpaceHeld] = useState(false);
    const spaceRef = useRef(false);
    const toolRef = useRef(tool);
    useEffect(() => {
        toolRef.current = tool;
    });

    useEffect(() => {
        const frame = scrollRef.current;
        if (!frame) return;
        let drag: Drag | null = null;

        const shouldPan = (event: PointerEvent) => {
            if (event.button === MIDDLE_BUTTON) return true;
            if (spaceRef.current || toolRef.current === "pan") return true;
            return event.target === frame;
        };

        const onDown = (event: PointerEvent) => {
            if (!shouldPan(event)) return;
            event.preventDefault();
            event.stopPropagation();
            frame.setPointerCapture(event.pointerId);
            frame.style.cursor = "grabbing";
            drag = {
                x: event.clientX,
                y: event.clientY,
                left: frame.scrollLeft,
                top: frame.scrollTop,
            };
        };

        const onMove = (event: PointerEvent) => {
            if (!drag) return;
            frame.scrollLeft = drag.left - (event.clientX - drag.x);
            frame.scrollTop = drag.top - (event.clientY - drag.y);
        };

        const onUp = () => {
            drag = null;
            frame.style.cursor = "";
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" || isSpaceKeyTarget(event.target))
                return;
            event.preventDefault();
            spaceRef.current = true;
            setSpaceHeld(true);
        };

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.code !== "Space") return;
            spaceRef.current = false;
            setSpaceHeld(false);
        };

        frame.addEventListener("pointerdown", onDown, true);
        frame.addEventListener("pointermove", onMove);
        frame.addEventListener("pointerup", onUp);
        frame.addEventListener("pointercancel", onUp);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            frame.removeEventListener("pointerdown", onDown, true);
            frame.removeEventListener("pointermove", onMove);
            frame.removeEventListener("pointerup", onUp);
            frame.removeEventListener("pointercancel", onUp);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [scrollRef]);

    return { panMode: tool === "pan" || spaceHeld };
};
