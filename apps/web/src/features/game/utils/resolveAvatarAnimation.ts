import type { AvatarAnimation } from "@standin/contracts";

type Params = {
    isSitting: boolean;
    isMoving: boolean;
    isBlinking: boolean;
    isEmoting: boolean;
};

// Which animation of the grid an avatar plays: seated wins over everything,
// then the emote gesture, then walking, then the eyes closed, and standing
// still is the rest. The caller only says it is emoting while the avatar can,
// which is standing still.
export const resolveAvatarAnimation = ({
    isSitting,
    isMoving,
    isBlinking,
    isEmoting,
}: Params): AvatarAnimation => {
    if (isSitting) return "SIT";
    if (isEmoting) return "EMOTE";
    if (isMoving) return "WALK";
    if (isBlinking) return "BLINK";
    return "IDLE";
};
