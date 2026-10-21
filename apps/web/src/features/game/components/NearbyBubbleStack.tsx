import { useRef, type CSSProperties } from "react";
import { useFloatAnimation } from "@/features/game/hooks/useFloatAnimation";
import { NEARBY_BUBBLE, NEARBY_CONTEXTS } from "@/features/game/consts/nearby";

export type NearbyBubbleStackLine = {
    id: string;
    text: string;
    opacity: number;
};

export type NearbyBubbleStackProps = {
    // From the oldest to the newest, which is drawn at the bottom.
    lines: NearbyBubbleStackLine[];
    // The color of the person, the same in the list of the panel.
    color: string;
};

// The messages over an avatar, up to three, the newest at the bottom. Each one
// floats up and fades out by itself. It has no position: the game places it over the name tag (`NearbyBubbles`).
// The text is always plain text, and the styles are inline like the name tag,
// so the bubble looks the same wherever it is mounted.
export const NearbyBubbleStack = ({ lines, color }: NearbyBubbleStackProps) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: NEARBY_BUBBLE.STACK_GAP,
            pointerEvents: "none",
        }}
    >
        {lines.map((line) => (
            <NearbyBubbleLine key={line.id} line={line} color={color} />
        ))}
    </div>
);

type LineProps = { line: NearbyBubbleStackLine; color: string };

const NearbyBubbleLine = ({ line, color }: LineProps) => {
    const ref = useRef<HTMLDivElement | null>(null);
    useFloatAnimation(ref, {
        riseY: NEARBY_BUBBLE.FLOAT_PX,
        lifeMs: NEARBY_CONTEXTS.MAP.timeoutMs,
        enterMs: NEARBY_BUBBLE.ENTER_MS,
        enterOffsetY: NEARBY_BUBBLE.ENTER_OFFSET_Y,
        fadeStart: NEARBY_BUBBLE.FADE_START,
    });

    const style: CSSProperties = {
        boxSizing: "border-box",
        maxWidth: NEARBY_BUBBLE.MAX_WIDTH,
        padding: `${NEARBY_BUBBLE.PADDING_Y}px ${NEARBY_BUBBLE.PADDING_X}px`,
        borderRadius: NEARBY_BUBBLE.RADIUS,
        backgroundColor: color,
        color: NEARBY_BUBBLE.TEXT_COLOR,
        fontFamily: '"Inter Variable", Inter, system-ui, sans-serif',
        fontSize: NEARBY_BUBBLE.FONT_SIZE,
        fontWeight: NEARBY_BUBBLE.FONT_WEIGHT,
        lineHeight: `${NEARBY_BUBBLE.LINE_HEIGHT}px`,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: "none",
    };

    // The outer one holds the opacity of the place in the stack, the inner one
    // is animated, so the two never fight over the same property.
    return (
        <div style={{ opacity: line.opacity }}>
            <div ref={ref} style={style}>
                {line.text}
            </div>
        </div>
    );
};
