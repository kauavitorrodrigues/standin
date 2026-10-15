import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";
import { ZoomControls } from "@/features/editor/components/views/ZoomControls";
import { DEFAULT_ZOOM, type Zoom } from "../../../consts/editorZoom";
import { useWheelZoom } from "../../../hooks/useWheelZoom";
import { getZoomStep } from "../../../utils/getZoomStep";

type Props = {
    zoom: Zoom;
    onZoomChange: (zoom: Zoom) => void;
    // Lets an editor stretch the stage to the room it has.
    className?: string;
    // What floats at the top center, like the tabs that switch the editor.
    leading?: ReactNode;
    // What floats at the bottom center, like the buttons that close the form.
    actions?: ReactNode;
    // The canvas, and the panels that float over it.
    children: ReactNode;
};

// The area of the image with the zoom floating on its bottom right corner,
// like the one of the other editors. What floats over it is placed in the
// area, not in the image, so it stays put while the image scrolls.
export const EditorStage = ({
    zoom,
    onZoomChange,
    className,
    leading,
    actions,
    children,
}: Props) => {
    const stage = useRef<HTMLDivElement>(null);
    useWheelZoom(stage, zoom, onZoomChange);
    const zoomIn = getZoomStep(zoom, 1);
    const zoomOut = getZoomStep(zoom, -1);
    const moveTo = (next: Zoom | null) => () => {
        if (next) onZoomChange(next);
    };

    return (
        <div
            ref={stage}
            className={cn(
                "relative flex max-h-[40rem] min-h-[26rem] min-w-0 flex-col",
                className
            )}
        >
            {children}
            <StageLeading leading={leading} />
            <StageActions actions={actions} />
            <FloatingPanel className="text-muted-foreground right-3 bottom-3 p-1 text-xs">
                <ZoomControls
                    zoom={zoom}
                    canZoomIn={zoomIn !== null}
                    canZoomOut={zoomOut !== null}
                    onZoomIn={moveTo(zoomIn)}
                    onZoomOut={moveTo(zoomOut)}
                    onReset={() => onZoomChange(DEFAULT_ZOOM)}
                    resetLabel="Zoom padrão"
                />
            </FloatingPanel>
        </div>
    );
};

const StageLeading = ({ leading }: { leading?: ReactNode }) => {
    if (!leading) return null;

    return (
        <FloatingPanel className="top-3 left-1/2 -translate-x-1/2 p-0.5">
            {leading}
        </FloatingPanel>
    );
};

const StageActions = ({ actions }: { actions?: ReactNode }) => {
    if (!actions) return null;

    return (
        <FloatingPanel className="bottom-3 left-1/2 -translate-x-1/2 p-1">
            {actions}
        </FloatingPanel>
    );
};
