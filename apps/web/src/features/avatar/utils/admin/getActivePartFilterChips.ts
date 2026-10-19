import type { ActiveFilterChip } from "../../types/admin/activeFilterChip";
import type { AvatarPartFilters } from "../../types/admin/partFilters";
import { getSlotLabel } from "./getSlotLabel";

// One chip per filter in use, in the order of the sidebar.
export const getActivePartFilterChips = ({
    slot,
}: AvatarPartFilters): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = [];

    if (slot) {
        chips.push({ field: "slot", title: "Tipo", label: getSlotLabel(slot) });
    }

    return chips;
};
