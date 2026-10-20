import { AVATAR_BUBBLE } from "../../consts/bubble";
import { getAvatarFrameStyle } from "../../utils/getAvatarFrameStyle";
import { getBubbleSheetUrl } from "../../utils/getBubbleSheetUrl";

type Props = {
    // The assembled sheet of the person, or null for the ghost.
    sheetFileId: string | null;
    size?: number;
    // How many times the frame is enlarged. Use a whole number.
    scale?: number;
};

// The avatar of a person in a circle, standing still and facing the front. It
// is a frame of the sheet cut by CSS, so it needs no canvas and no Phaser.
export const AvatarFrameBubble = ({
    sheetFileId,
    size = AVATAR_BUBBLE.SIZE_PX,
    scale = AVATAR_BUBBLE.SCALE,
}: Props) => (
    <div
        role="img"
        aria-label="Avatar"
        className="relative overflow-hidden rounded-full bg-muted"
        style={{ width: size, height: size }}
    >
        <div
            className="absolute"
            style={getAvatarFrameStyle(
                getBubbleSheetUrl(sheetFileId),
                scale,
                size
            )}
        />
    </div>
);
