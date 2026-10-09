import { MicOffIcon, Maximize2Icon, MonitorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageTile } from "@/features/spaces/types/stage";
import { activateOnKey } from "@/features/spaces/utils/activateOnKey";
import { TileSurface } from "@/features/spaces/components/pages/space-page/stage/TileSurface";

type VideoTileProps = {
    tile: StageTile;
    onSelect?: () => void;
    isSelected?: boolean;
    isVideoPaused?: boolean;
    // Shows an expand icon on hover, telling that opening the tile leads to
    // the full view.
    showExpandHint?: boolean;
    className?: string;
};

export const VideoTile = ({
    tile,
    onSelect,
    isSelected,
    isVideoPaused,
    showExpandHint = false,
    className,
}: VideoTileProps) => (
    <figure
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        aria-pressed={onSelect ? Boolean(isSelected) : undefined}
        aria-label={onSelect ? tile.label : undefined}
        onKeyDown={onSelect ? activateOnKey(onSelect) : undefined}
        className={cn(
            "group/tile pointer-events-auto relative shrink-0 overflow-hidden rounded-lg bg-black shadow-lg ring-1 ring-white/10",
            "h-24 aspect-video",
            isSelected && "ring-2 ring-primary",
            onSelect && "cursor-pointer",
            className
        )}
        onClick={onSelect}
    >
        <TileSurface tile={tile} isVideoPaused={isVideoPaused} />
        {showExpandHint && (
            <span
                aria-hidden
                className="pointer-events-none absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-neutral-900/70 text-white opacity-0 backdrop-blur-md transition-opacity group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100"
            >
                <Maximize2Icon className="size-3.5" />
            </span>
        )}
        <figcaption className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-md bg-neutral-900/70 px-1.5 py-0.5 text-xs text-white backdrop-blur-md">
            {tile.slot === "screen" && (
                <MonitorIcon className="size-3 shrink-0" />
            )}
            {tile.isMuted && (
                <MicOffIcon
                    aria-label="Microfone desligado"
                    className="size-3 shrink-0 text-red-400"
                />
            )}
            <span className="truncate">{tile.label}</span>
        </figcaption>
    </figure>
);
