import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDownIcon, UsersIcon } from "lucide-react";
import { NearbySummary } from "@/features/spaces/components/pages/space-page/controls/NearbySummary";
import { NEARBY_MAX_SQUARES } from "@/features/spaces/consts/controls";
import { VideoTile } from "@/features/spaces/components/pages/space-page/stage/VideoTile";
import type { StageTile } from "@/features/spaces/types/stage";

type Props = { tiles: StageTile[] };

// Who is near you, for when the office is not on screen. Collapsible, and it
// renders nothing while nobody is around.
export const NearbyPeople = ({ tiles }: Props) => {
    const people = tiles.filter((tile) => tile.slot === "camera");
    const nearby = people.filter((tile) => !tile.isSelf);

    if (nearby.length === 0) return null;

    const hasOverflow = people.length > NEARBY_MAX_SQUARES;
    const visible = hasOverflow ? people.slice(0, NEARBY_MAX_SQUARES - 1) : people;
    const hiddenCount = people.length - visible.length;

    return (
        <Collapsible.Root className="flex flex-col gap-2 rounded-xl bg-background p-1.5">
            <Collapsible.Trigger className="group/nearby flex items-center gap-2 rounded-lg px-1 py-0.5 text-xs font-medium text-muted-foreground cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring/50">
                <UsersIcon className="size-3.5" />
                <span className="flex-1 text-left">Perto de você</span>
                <NearbySummary people={nearby} />
                <ChevronDownIcon className="size-3.5 transition-transform group-data-[panel-open]/nearby:rotate-180" />
            </Collapsible.Trigger>
            <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-200 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0">
                <div className="grid grid-cols-2 gap-1.5">
                    {visible.map((tile) => (
                        <VideoTile
                            key={tile.id}
                            tile={tile}
                            className="aspect-square h-auto w-full"
                        />
                    ))}
                    {hasOverflow && (
                        <div
                            aria-label={`Mais ${hiddenCount} pessoas por perto`}
                            className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-lg font-medium ring-1 ring-foreground/10"
                        >
                            +{hiddenCount}
                        </div>
                    )}
                </div>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
};
