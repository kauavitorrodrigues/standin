import type { KeyboardEvent } from "react";
import { MonitorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageTile } from "../../types/stage";
import { TileSurface } from "./TileSurface";

const TILE_SIZE_BY_SLOT: Record<StageTile["slot"], string> = {
    screen: "h-28 aspect-video",
    camera: "h-24 aspect-video",
};

type VideoTileProps = {
    tile: StageTile;
    onSelect?: () => void;
    isSelected?: boolean;
    isVideoPaused?: boolean;
    className?: string;
};

// Enter and Space activate a tile the same way a click does, so choosing a
// tile does not need a mouse.
const activateOnKey =
    (onSelect: () => void) => (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
    };

export const VideoTile = ({
    tile,
    onSelect,
    isSelected,
    isVideoPaused,
    className,
}: VideoTileProps) => (
    <figure
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        aria-pressed={onSelect ? Boolean(isSelected) : undefined}
        aria-label={onSelect ? tile.label : undefined}
        onKeyDown={onSelect ? activateOnKey(onSelect) : undefined}
        className={cn(
            "pointer-events-auto relative shrink-0 overflow-hidden rounded-lg bg-black shadow-lg ring-1 ring-white/10",
            TILE_SIZE_BY_SLOT[tile.slot],
            isSelected && "ring-2 ring-primary",
            onSelect && "cursor-pointer",
            className
        )}
        onClick={onSelect}
    >
        <TileSurface tile={tile} isVideoPaused={isVideoPaused} />
        <figcaption className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-md bg-neutral-900/70 px-1.5 py-0.5 text-xs text-white backdrop-blur-md">
            {tile.slot === "screen" && (
                <MonitorIcon className="size-3 shrink-0" />
            )}
            <span className="truncate">{tile.label}</span>
        </figcaption>
    </figure>
);
