import { ASSET_PLACEMENT_META } from "@/features/assets/consts/placementMeta";
import { ASSET_TYPE_META } from "@/features/assets/consts/typeMeta";
import type { ActiveFilterChip } from "@/features/assets/types/activeFilterChip";
import type { LibraryFilters } from "@/features/assets/types/libraryFilters";

// One chip per filter in use, in the order of the sidebar, with the label
// and the icon of the meta of its value.
export const getActiveFilterChips = ({
    type,
    placement,
    inUse,
}: LibraryFilters): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = [];

    if (type) {
        const { label, icon } = ASSET_TYPE_META[type];
        chips.push({ field: "type", title: "Tipo", label, icon });
    }
    if (placement) {
        const { label, icon } = ASSET_PLACEMENT_META[placement];
        chips.push({
            field: "placement",
            title: "Posicionamento",
            label,
            icon,
        });
    }
    if (inUse !== undefined) {
        chips.push({
            field: "inUse",
            title: "Uso",
            label: inUse ? "Em uso" : "Livre",
        });
    }

    return chips;
};
