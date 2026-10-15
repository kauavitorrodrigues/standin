// A room outlined with the eight pieces of a thin wall, seen from above, with
// an avatar inside, for the card of the type.
export const WallIllustration = () => (
    <svg
        viewBox="0 0 180 90"
        className="h-full w-full"
        role="img"
        aria-label="Sala cercada por paredes finas"
    >
        <rect
            x={30}
            y={18}
            width={120}
            height={56}
            className="fill-emerald-900/30"
        />
        <rect
            x={26}
            y={8}
            width={128}
            height={14}
            className="fill-indigo-500/70"
        />
        <rect
            x={26}
            y={8}
            width={128}
            height={4}
            className="fill-indigo-300/70"
        />
        <rect
            x={26}
            y={68}
            width={128}
            height={14}
            className="fill-indigo-500/70"
        />
        <rect
            x={26}
            y={68}
            width={128}
            height={4}
            className="fill-indigo-300/70"
        />
        <rect
            x={26}
            y={20}
            width={4}
            height={50}
            className="fill-indigo-300/80"
        />
        <rect
            x={150}
            y={20}
            width={4}
            height={50}
            className="fill-indigo-300/80"
        />
        <rect
            x={74}
            y={68}
            width={32}
            height={14}
            className="fill-background"
        />
        <circle cx={90} cy={46} r={6} className="fill-amber-400" />
    </svg>
);
