import type { RefCallback, RefObject } from "react";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";

type EditorCanvasProps = {
    containerRef: RefCallback<HTMLDivElement>;
    coordinatesRef: RefObject<HTMLElement | null>;
    hintRef: RefObject<HTMLElement | null>;
};

// Where the engine mounts the Phaser game, and the readout of the cell under
// the cursor, with the one-line hint of the active tool above it. The map takes the room the side panel leaves, and the readout moves aside for the side panel while it is open. The refs come from useEditorEngine.
export const EditorCanvas = ({
    containerRef,
    coordinatesRef,
    hintRef,
}: EditorCanvasProps) => {
    const panelOpen = useEditorSelector((state) => state.panelOpen);

    return (
        <div className="relative h-full w-full">
            <div
                data-panel-open={panelOpen}
                className="absolute inset-y-0 right-0 left-0 data-[panel-open=true]:left-[calc(18rem+1.5rem)]"
            >
                <div ref={containerRef} className="h-full w-full" />
            </div>
            <span
                ref={coordinatesRef}
                data-panel-open={panelOpen}
                className="bg-background/90 pointer-events-none absolute bottom-3 left-3 z-99 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-muted-foreground shadow-sm backdrop-blur data-[panel-open=true]:left-[calc(18rem+1.5rem+0.75rem)] empty:hidden"
            />
            <span
                ref={hintRef}
                data-panel-open={panelOpen}
                className="bg-background/90 pointer-events-none absolute bottom-14 left-3 z-99 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur data-[panel-open=true]:left-[calc(18rem+1.5rem+0.75rem)] empty:hidden"
            />
        </div>
    );
};
