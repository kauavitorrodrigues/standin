import { MEDIA_PAUSE_REASONS } from "@standin/contracts";
import { HandIcon, MicOffIcon, Maximize2Icon, MonitorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRaisedHandUserIds } from "@/features/spaces/hand-raise/contexts/RaisedHandsContext";
import type { StageTile } from "@/features/spaces/types/stage";
import { activateOnKey } from "@/features/spaces/utils/activateOnKey";
import { HideVideoButton } from "@/features/spaces/components/pages/space-page/stage/HideVideoButton";
import { PinButton } from "@/features/spaces/components/pages/space-page/stage/PinButton";
import { useStageVideoActions } from "@/features/spaces/components/pages/space-page/stage/StageVideoActions";
import { TileSurface } from "@/features/spaces/components/pages/space-page/stage/TileSurface";

type VideoTileProps = {
    tile: StageTile;
    onSelect?: () => void;
    isSelected?: boolean;
    isVideoPaused?: boolean;
    // Shows an expand icon on hover, telling that opening the tile leads to
    // the full view.
    showExpandHint?: boolean;
    // Shows the pin button when given.
    isPinned?: boolean;
    onTogglePin?: () => void;
    className?: string;
};

export const VideoTile = ({
    tile,
    onSelect,
    isSelected,
    isVideoPaused,
    showExpandHint = false,
    isPinned = false,
    onTogglePin,
    className,
}: VideoTileProps) => {
    const { hideVideo, showVideo } = useStageVideoActions();
    const raisedHandUserIds = useRaisedHandUserIds();
    // The hand goes on the camera of the person, never on their screen.
    const hasHandUp =
        tile.slot === "camera" &&
        tile.userId !== null &&
        raisedHandUserIds.has(tile.userId);
    const isHidden = tile.notice === MEDIA_PAUSE_REASONS.USER_HIDDEN;
    // Only the camera of somebody else has a video to hide, and hiding it
    // takes their screen too. A hidden person offers to be shown again.
    const canHide =
        hideVideo !== undefined &&
        !isHidden &&
        !tile.isSelf &&
        tile.slot === "camera" &&
        tile.userId !== null &&
        tile.stream !== null;
    const canShow = showVideo !== undefined && isHidden && tile.userId !== null;

    return (
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
                    className="pointer-events-none absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-neutral-900/80 text-white opacity-0 transition-opacity group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100"
                >
                    <Maximize2Icon className="size-3.5" />
                </span>
            )}
            <TilePin isPinned={isPinned} onTogglePin={onTogglePin} />
            {canHide && (
                <HideVideoButton
                    isHidden={false}
                    afterPin={onTogglePin !== undefined}
                    onToggle={() => hideVideo(tile.userId!)}
                />
            )}
            {canShow && (
                <HideVideoButton
                    isHidden
                    afterPin={onTogglePin !== undefined}
                    onToggle={() => showVideo(tile.userId!)}
                />
            )}
            <RaisedHandBadge isUp={hasHandUp} />
            <figcaption className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-md bg-neutral-900/80 px-1.5 py-0.5 text-xs text-white">
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
};

type TilePinProps = {
    isPinned: boolean;
    onTogglePin?: () => void;
};

const TilePin = ({ isPinned, onTogglePin }: TilePinProps) => {
    if (!onTogglePin) return null;

    return <PinButton isPinned={isPinned} onToggle={onTogglePin} />;
};

// Pops in with a clear overshoot, and shrinks away.
const BADGE_UP_CLASSES =
    "scale-100 opacity-100 duration-500 ease-[cubic-bezier(0.34,1.8,0.5,1)]";
const BADGE_DOWN_CLASSES = "scale-0 opacity-0 duration-300 ease-in";

// The hand waves once in place; on the way out it tips over.
const HAND_UP_CLASSES = "animate-hand-raise origin-bottom";
const HAND_DOWN_CLASSES =
    "-rotate-12 transition-transform duration-300 ease-in";

type RaisedHandBadgeProps = {
    isUp: boolean;
};

// The badge stays mounted and only changes state, so it can animate out as
// well as in. It sits in the bottom right corner, clear of the name in the
// bottom left and of the buttons in the top right.
const RaisedHandBadge = ({ isUp }: RaisedHandBadgeProps) => (
    <span
        role="img"
        aria-label="Mão levantada"
        aria-hidden={!isUp}
        className={cn(
            "pointer-events-none absolute right-3 bottom-3 flex size-7 origin-center items-center justify-center rounded-full border border-white/30 bg-primary text-primary-foreground shadow-lg transition-[transform,opacity]",
            isUp && BADGE_UP_CLASSES,
            !isUp && BADGE_DOWN_CLASSES
        )}
    >
        {isUp && (
            <span
                aria-hidden
                className="absolute inset-0 animate-hand-ripple rounded-full bg-primary"
            />
        )}
        <HandIcon
            className={cn(
                "relative size-3.5",
                isUp && HAND_UP_CLASSES,
                !isUp && HAND_DOWN_CLASSES
            )}
        />
    </span>
);
