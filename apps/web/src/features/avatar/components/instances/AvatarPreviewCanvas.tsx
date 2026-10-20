import type { AvatarLayer } from "@standin/contracts";
import { cn } from "@/lib/utils";
import {
    PREVIEW_CANVAS_SIZE,
    useAvatarPreviewCanvas,
} from "../../hooks/useAvatarPreviewCanvas";

type AvatarPreviewCanvasProps = {
    // The layers already in drawing order, as `orderLayers` leaves them. An
    // empty list draws only the scene.
    layers: readonly AvatarLayer[];
    className?: string;
};

// The avatar over a fixed scene, drawn outside the game. Clicking it, or
// pressing an arrow key, turns it through the four directions, and it walks
// while the pointer is over it. The editor and the part preview of the admin
// share it.
export const AvatarPreviewCanvas = ({
    layers,
    className,
}: AvatarPreviewCanvasProps) => {
    const { canvasRef, handlers } = useAvatarPreviewCanvas({ layers });

    return (
        <button
            type="button"
            aria-label="Girar o avatar"
            className={cn(
                "block cursor-pointer overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                className
            )}
            {...handlers}
        >
            <canvas
                ref={canvasRef}
                width={PREVIEW_CANVAS_SIZE.width}
                height={PREVIEW_CANVAS_SIZE.height}
                className="block h-full w-full object-cover [image-rendering:pixelated]"
            />
        </button>
    );
};
