import { CheckIcon, MapIcon } from "lucide-react";
import type { MapEntity } from "@standin/contracts";
import { cn } from "@/lib/utils";

type Props = {
    map: MapEntity;
    selected: boolean;
    onSelect: () => void;
};

export function SelectableMapCard({ map, selected, onSelect }: Props) {
    return (
        <button
            type="button"
            onClick={onSelect}
            data-selected={selected}
            className="group flex flex-col gap-2 rounded-xl text-left outline-none"
        >
            <div
                className={cn(
                    "relative flex aspect-video w-full items-center justify-center rounded-xl bg-muted ring-2 ring-transparent transition-colors group-hover:ring-primary/40",
                    selected && "ring-primary group-hover:ring-primary",
                )}
            >
                <MapIcon className="size-8 text-muted-foreground" />
                {selected && (
                    <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" />
                    </div>
                )}
            </div>
            <div className="flex flex-col px-1">
                <span className="text-sm font-medium">{map.name}</span>
                <span className="text-xs text-muted-foreground">
                    {map.width}x{map.height} · tile {map.tileSize}px
                </span>
            </div>
        </button>
    );
}
