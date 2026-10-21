import { EMOTE_TEXTURE } from "@/features/game/consts/emote";

const CENTER_DIVISOR = 2;

// Draws the emoji in the middle of a square canvas, with the font of the
// system, so any emoji works without art of its own.
export const drawEmoji = (
    context: CanvasRenderingContext2D,
    emoji: string
): void => {
    const { SIZE, FONT_SIZE, FONT_FAMILY } = EMOTE_TEXTURE;
    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(emoji, SIZE / CENTER_DIVISOR, SIZE / CENTER_DIVISOR);
};
