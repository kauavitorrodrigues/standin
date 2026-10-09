import { LocateFixedIcon, MinusIcon, PlusIcon } from "lucide-react";
import { FloatingIconButton } from "@/components/FloatingIconButton";
import { useHotkey } from "@/hooks/useHotkey";
import {
    FOCUS_PLAYER_SHORTCUT,
    ZOOM_IN_SHORTCUT,
    ZOOM_OUT_SHORTCUT,
} from "@/features/game/consts/shortcuts";
import { useCameraState } from "@/features/game/hooks/useCameraState";
import type { GameEngineHandle } from "@/features/game/types/game";

type GameControlsProps = {
    handle: GameEngineHandle | null;
};

export const GameControls = ({ handle }: GameControlsProps) => {
    const cameraState = useCameraState(handle);

    useHotkey(FOCUS_PLAYER_SHORTCUT.keys, () => handle?.focusOnPlayer(), {
        enabled: !!handle && !cameraState.isFollowingPlayer,
    });
    useHotkey(ZOOM_IN_SHORTCUT.keys, () => handle?.zoomIn(), {
        enabled: !!handle && cameraState.canZoomIn,
    });
    useHotkey(ZOOM_OUT_SHORTCUT.keys, () => handle?.zoomOut(), {
        enabled: !!handle && cameraState.canZoomOut,
    });

    if (!handle) return null;

    return (
        <div className="absolute right-3 bottom-3 z-10 flex flex-col items-center gap-2">
            <FloatingIconButton
                icon={<LocateFixedIcon />}
                label="Centralizar no personagem"
                shortcut={FOCUS_PLAYER_SHORTCUT.label}
                onClick={handle.focusOnPlayer}
                disabled={cameraState.isFollowingPlayer}
                className="size-8 rounded-lg bg-muted text-foreground ring-1 ring-foreground/10 hover:bg-accent hover:text-foreground"
            />
            <div className="flex flex-col overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                <FloatingIconButton
                    icon={<PlusIcon />}
                    label="Aumentar zoom"
                    shortcut={ZOOM_IN_SHORTCUT.label}
                    onClick={handle.zoomIn}
                    disabled={!cameraState.canZoomIn}
                    className="size-8 rounded-none bg-transparent text-foreground hover:bg-foreground/10 hover:text-foreground"
                />
                <FloatingIconButton
                    icon={<MinusIcon />}
                    label="Diminuir zoom"
                    shortcut={ZOOM_OUT_SHORTCUT.label}
                    onClick={handle.zoomOut}
                    disabled={!cameraState.canZoomOut}
                    className="size-8 rounded-none bg-transparent text-foreground hover:bg-foreground/10 hover:text-foreground"
                />
            </div>
        </div>
    );
};
