import { MapIcon } from "lucide-react";
import type { MapEntity } from "@standin/contracts";
import { MapActions } from "@/features/maps/components/MapActions";

export function MapCard({ map }: { map: MapEntity }) {
    const isGlobal = map.organizationId === null;

    return (
        <div className="group flex flex-col gap-2">
            <div className="relative flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
                <MapIcon className="size-8 text-muted-foreground" />
                {isGlobal ? (
                    <span className="absolute top-2 right-2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                        Compartilhado
                    </span>
                ) : (
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <MapActions map={map} />
                    </div>
                )}
            </div>
            <div className="flex flex-col px-1">
                <span className="text-sm font-medium">{map.name}</span>
                <span className="text-xs text-muted-foreground">
                    {map.width}x{map.height} · tile {map.tileSize}px
                </span>
            </div>
        </div>
    );
}
