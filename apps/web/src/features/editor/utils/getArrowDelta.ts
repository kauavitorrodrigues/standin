import type { Cell } from "@standin/contracts";
import type { ArrowDirection } from "@/features/editor/types/arrow-direction";

// One tile in the direction of the arrow key.
export const getArrowDelta = (direction: ArrowDirection): Cell => {
    switch (direction) {
        case "up":
            return [0, -1];
        case "down":
            return [0, 1];
        case "left":
            return [-1, 0];
        case "right":
            return [1, 0];
    }
};
