import type { ReactNode } from "react";
import { CheckIcon } from "lucide-react";

type Props = {
    illustration: ReactNode;
    title: string;
    description: string;
    // What the user sends and what comes out by itself.
    points: readonly string[];
    onClick: () => void;
};

export const TilesetKindCard = ({
    illustration,
    title,
    description,
    points,
    onClick,
}: Props) => (
    <button
        type="button"
        onClick={onClick}
        className="hover:border-primary/60 hover:bg-muted/40 focus-visible:ring-ring flex flex-col gap-4 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2"
    >
        <span className="bg-muted/50 flex h-36 w-full items-center justify-center rounded-lg p-3">
            {illustration}
        </span>
        <span className="flex flex-col gap-1">
            <span className="text-base font-semibold">{title}</span>
            <span className="text-muted-foreground text-sm">{description}</span>
        </span>
        <ul className="flex flex-col gap-1.5">
            {points.map((point) => (
                <li
                    key={point}
                    className="text-muted-foreground flex items-start gap-2 text-xs"
                >
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                    {point}
                </li>
            ))}
        </ul>
    </button>
);
