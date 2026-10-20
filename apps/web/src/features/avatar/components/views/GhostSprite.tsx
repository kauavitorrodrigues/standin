import {
    AVATAR,
    AVATAR_FRAMES,
    AVATAR_SHEET_PX,
    PLAYER_DIRECTIONS,
    type AvatarAnimation,
    type PlayerDirection,
} from "@standin/contracts";
import { AVATAR_PUBLIC_SHEETS } from "../../consts/paths";

type Props = {
    // Where the feet are, in px, inside the closest positioned parent.
    x: number;
    feetY: number;
    direction?: PlayerDirection;
    // The first frame of this animation is the one shown.
    animation?: AvatarAnimation;
    // How many times the frame is enlarged. Use a whole number.
    scale?: number;
    zIndex?: number;
    title?: string;
};

// The ghost, as the game draws it, standing with its feet at the point. It is
// a frame of its sheet (the idle one by default), cut by CSS, so it needs
// no canvas and no Phaser.
export const GhostSprite = ({
    x,
    feetY,
    direction = PLAYER_DIRECTIONS.DOWN,
    animation = "IDLE",
    scale = 1,
    zIndex,
    title,
}: Props) => {
    const [col] = AVATAR_FRAMES[animation][direction];

    return (
        <div
            role="img"
            aria-label="Fantasma"
            title={title}
            className="pointer-events-none absolute"
            style={{
                left: x - AVATAR.anchor.x * scale,
                top: feetY - AVATAR.anchor.y * scale,
                width: AVATAR.frame.w * scale,
                height: AVATAR.frame.h * scale,
                backgroundImage: `url(${AVATAR_PUBLIC_SHEETS.GHOST})`,
                backgroundSize: `${AVATAR_SHEET_PX.w * scale}px ${AVATAR_SHEET_PX.h * scale}px`,
                backgroundPosition: `${-col * AVATAR.frame.w * scale}px 0`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                zIndex,
            }}
        />
    );
};
