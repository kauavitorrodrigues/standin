import { CheckIcon } from "lucide-react";

type Props = {
    // From 0 to 100.
    percent: number;
    taggedCount: number;
    tileCount: number;
};

const SIZE = 36;
const STROKE = 3.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// How much of the sheet has a category, as a ring with the percent inside.
// The count of tiles is not written on the card, only on hover and for screen
// readers.
export const TilesetProgressRing = ({
    percent,
    taggedCount,
    tileCount,
}: Props) => {
    const label = `${taggedCount} de ${tileCount} tiles com categoria`;

    return (
        <div
            role="img"
            aria-label={label}
            title={label}
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: SIZE, height: SIZE }}
        >
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="-rotate-90"
            >
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    className="stroke-muted"
                />
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
                    className="stroke-primary transition-[stroke-dashoffset]"
                />
            </svg>
            <TilesetProgressRingCenter percent={percent} />
        </div>
    );
};

const TilesetProgressRingCenter = ({ percent }: { percent: number }) => {
    if (percent === 100) {
        return <CheckIcon className="text-primary absolute size-4" />;
    }
    return (
        <span className="absolute text-[10px] font-medium tabular-nums">
            {percent}%
        </span>
    );
};
