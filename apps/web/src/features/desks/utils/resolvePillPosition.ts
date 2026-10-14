import type { HoverState } from "@/features/game/types/hover";

// Selected: over the top edge of the desk, centered. Hovered: under the
// bottom edge at the right corner, like a tooltip.
export type PillPlacement = "above" | "below";

export const resolvePillPosition = (
    { screen }: Pick<HoverState, "screen">,
    placement: PillPlacement
): { left: number; top: number } => {
    switch (placement) {
        case "above":
            return { left: screen.x + screen.width / 2, top: screen.y };
        case "below":
            return {
                left: screen.x + screen.width,
                top: screen.y + screen.height,
            };
    }
};
