import { LocateFixedIcon, MinusIcon, PlusIcon } from "lucide-react";
import { FloatingIconButton } from "@/components/FloatingIconButton";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useCameraState } from "@/features/game/hooks/useCameraState";
import type { GameEngineHandle } from "@/features/game/types/game";

type GameControlsProps = {
    handle: GameEngineHandle | null;
};

export const GameControls = ({ handle }: GameControlsProps) => {
    const { open, isMobile } = useSidebar();
    const isSidebarOpen = open && !isMobile;
    const cameraState = useCameraState(handle);

    if (!handle) return null;

    return (
        <div
            className={cn(
                "absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 transition-[right] duration-200 ease-linear",
                isSidebarOpen ? "right-[calc(var(--sidebar-width)+1rem)]" : "right-4"
            )}
        >
            <FloatingIconButton
                icon={<LocateFixedIcon />}
                label="Centralizar no personagem"
                onClick={handle.focusOnPlayer}
                disabled={cameraState.isFollowingPlayer}
                className="rounded-full shadow-lg backdrop-blur-md size-11"
            />
            <div className="flex flex-col overflow-hidden">
                <FloatingIconButton
                    icon={<PlusIcon />}
                    label="Aumentar zoom"
                    onClick={handle.zoomIn}
                    disabled={!cameraState.canZoomIn}
                    className="rounded-b-none border-b size-11 shadow-lg backdrop-blur-md"
                />
                <FloatingIconButton
                    icon={<MinusIcon />}
                    label="Diminuir zoom"
                    onClick={handle.zoomOut}
                    disabled={!cameraState.canZoomOut}
                    className="rounded-t-none size-11 shadow-lg backdrop-blur-md"
                />
            </div>
        </div>
    );
};
