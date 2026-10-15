import type { ReactNode } from "react";
import { GAME_RENDER_CONFIG } from "@/features/game/consts/game-config";

type CanvasProps = {
    children: ReactNode;
};

// The color of the engine drives the background, so the strip beside the side
// panel that the canvas does not cover matches it.
export const Canvas = ({ children }: CanvasProps) => (
    <main
        className="relative min-h-0 min-w-0 flex-1"
        style={{ backgroundColor: GAME_RENDER_CONFIG.BACKGROUND_COLOR }}
    >
        {children}
    </main>
);
