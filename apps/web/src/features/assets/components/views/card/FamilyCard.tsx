import type { LibraryFamilySummary } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { FamilyPreview } from "@/features/assets/components/views/card/FamilyPreview";
import { ASSET_CATEGORY_DISPLAY_META } from "@/features/assets/consts/categoryMeta";
import { ASSET_PLACEMENT_META } from "@/features/assets/consts/placementMeta";
import {
    CARD_PREVIEW_BOX_PX,
    CARD_PREVIEW_MAX_SCALE,
} from "@/features/assets/consts/familyPreview";
import { FamilyCounts } from "./FamilyCounts";

type Props = {
    family: LibraryFamilySummary;
    selected: boolean;
    onSelect: () => void;
};

export function FamilyCard({ family, selected, onSelect }: Props) {
    const category = ASSET_CATEGORY_DISPLAY_META[family.category];
    const placement = ASSET_PLACEMENT_META[family.placement];
    const CategoryIcon = category.icon;
    const PlacementIcon = placement.icon;
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                "hover:border-ring/60 flex flex-col items-start gap-2 overflow-hidden rounded-lg border p-3 text-left outline-2 outline-offset-2 transition-[outline-color] duration-300",
                selected ? "outline-muted-foreground/20" : "outline-transparent"
            )}
        >
            <FamilyPreview
                thumbnail={family.thumbnail}
                box={CARD_PREVIEW_BOX_PX}
                maxScale={CARD_PREVIEW_MAX_SCALE}
                className="-mx-3 -mt-3 h-44 self-stretch"
            />
            <div className="flex w-full flex-col gap-1">
                <p className="truncate text-sm font-medium">{family.name}</p>
                <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                    <CategoryIcon
                        className="size-3.5 shrink-0"
                        style={{ color: category.color }}
                    />
                    {category.label}
                </p>
                <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                    <PlacementIcon
                        className="size-3.5 shrink-0"
                        style={{ color: placement.color }}
                    />
                    {placement.label}
                </p>
            </div>
            <FamilyCounts family={family} />
        </button>
    );
}
