import { useId } from "react";

const TILE = 30;
const COLUMNS = 8;
const ROWS = 6;
const FRAME = { x: 1, y: 1, w: 6, h: 4 };

const lines = (count: number) => Array.from({ length: count + 1 }, (_, i) => i);

// A small drawing of what the composer makes: a frame over a grid of tiles with
// its handles, and two pieces of furniture inside it. Everything sits on the
// lines of the grid, and the grid fades out toward the edges.
export const AreaCreateIllustration = () => {
    const id = useId();
    const fade = `${id}-fade`;
    const mask = `${id}-mask`;
    const frame = {
        left: FRAME.x * TILE,
        top: FRAME.y * TILE,
        right: (FRAME.x + FRAME.w) * TILE,
        bottom: (FRAME.y + FRAME.h) * TILE,
    };
    const middleX = (frame.left + frame.right) / 2;
    const middleY = (frame.top + frame.bottom) / 2;
    const handles = [frame.left, middleX, frame.right]
        .flatMap((x) =>
            [frame.top, middleY, frame.bottom].map((y) => ({ x, y }))
        )
        .filter(({ x, y }) => x !== middleX || y !== middleY);

    return (
        <svg
            viewBox={`-4 -4 ${COLUMNS * TILE + 8} ${ROWS * TILE + 8}`}
            role="img"
            aria-label="Moldura de uma área sobre uma grade de tiles"
            className="h-40 w-auto"
        >
            <defs>
                <radialGradient id={fade}>
                    <stop offset="55%" stopColor="white" />
                    <stop offset="100%" stopColor="black" />
                </radialGradient>
                <mask id={mask}>
                    <rect
                        x="-4"
                        y="-4"
                        width={COLUMNS * TILE + 8}
                        height={ROWS * TILE + 8}
                        fill={`url(#${fade})`}
                    />
                </mask>
            </defs>
            <g
                mask={`url(#${mask})`}
                className="stroke-muted-foreground/40"
                strokeWidth="1"
            >
                {lines(COLUMNS).map((column) => (
                    <line
                        key={`v${column}`}
                        x1={column * TILE}
                        y1="0"
                        x2={column * TILE}
                        y2={ROWS * TILE}
                    />
                ))}
                {lines(ROWS).map((row) => (
                    <line
                        key={`h${row}`}
                        x1="0"
                        y1={row * TILE}
                        x2={COLUMNS * TILE}
                        y2={row * TILE}
                    />
                ))}
            </g>
            <rect
                x={frame.left}
                y={frame.top}
                width={frame.right - frame.left}
                height={frame.bottom - frame.top}
                className="fill-primary/10 stroke-foreground"
                strokeWidth="1.5"
            />
            <rect
                x={2 * TILE + 3}
                y={2 * TILE + 3}
                width={2 * TILE - 6}
                height={TILE - 6}
                rx="4"
                className="fill-muted-foreground/50"
            />
            <rect
                x={5 * TILE + 3}
                y={3 * TILE + 3}
                width={TILE - 6}
                height={TILE - 6}
                rx="4"
                className="fill-muted-foreground/50"
            />
            {handles.map(({ x, y }) => (
                <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-foreground stroke-background"
                    strokeWidth="1.5"
                />
            ))}
        </svg>
    );
};
