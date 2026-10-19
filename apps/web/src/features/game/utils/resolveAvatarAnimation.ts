import type { AvatarAnimation } from "@standin/contracts";

type Params = {
    isSitting: boolean;
    isMoving: boolean;
    isBlinking: boolean;
};

// Which animation of the grid an avatar plays: seated wins over everything,
// then walking, then the eyes closed, and standing still is the rest.
export const resolveAvatarAnimation = ({
    isSitting,
    isMoving,
    isBlinking,
}: Params): AvatarAnimation => {
    if (isSitting) return "SIT";
    if (isMoving) return "WALK";
    if (isBlinking) return "BLINK";
    return "IDLE";
};
