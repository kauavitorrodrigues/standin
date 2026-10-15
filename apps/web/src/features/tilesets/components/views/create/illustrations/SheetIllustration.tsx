const COLUMNS = 6;
const ROWS = 3;
const TILE = 22;
const GAP = 4;

// A tile of each kind a sheet marks, drawn in a grid, for the card of the type.
const FILLS = [
    "fill-amber-500/40",
    "fill-amber-500/40",
    "fill-slate-500/60",
    "fill-slate-500/60",
    "fill-emerald-500/40",
    "fill-sky-500/40",
    "fill-amber-500/40",
    "fill-amber-500/40",
    "fill-slate-500/60",
    "fill-slate-500/60",
    "fill-emerald-500/40",
    "fill-sky-500/40",
    "fill-violet-500/40",
    "fill-violet-500/40",
    "fill-violet-500/40",
    "fill-slate-500/20",
    "fill-slate-500/20",
    "fill-slate-500/20",
];

export const SheetIllustration = () => (
    <svg
        viewBox="0 0 180 90"
        className="h-full w-full"
        role="img"
        aria-label="Folha em grade de tiles"
    >
        {FILLS.map((fill, index) => (
            <rect
                key={index}
                x={6 + (index % COLUMNS) * (TILE + GAP)}
                y={6 + Math.floor(index / COLUMNS) * (TILE + GAP)}
                width={TILE}
                height={TILE}
                rx={3}
                className={fill}
            />
        ))}
        <rect
            x={3}
            y={3}
            width={174}
            height={ROWS * (TILE + GAP) + 3}
            rx={5}
            className="fill-none stroke-slate-400/50"
            strokeDasharray="3 3"
        />
    </svg>
);
