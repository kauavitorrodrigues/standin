import { AVATAR_BASE_KIND_META } from "../../consts/admin/baseKindMeta";
import type { ActiveFilterChip } from "../../types/admin/activeFilterChip";
import type { AvatarBaseFilters } from "../../types/admin/baseFilters";

// One chip per filter in use, in the order of the sidebar.
export const getActiveBaseFilterChips = ({
    kind,
    hasPreview,
}: AvatarBaseFilters): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = [];

    if (kind) {
        const { label, icon } = AVATAR_BASE_KIND_META[kind];
        chips.push({ field: "kind", title: "Tipo", label, icon });
    }
    if (hasPreview !== undefined) {
        chips.push({
            field: "hasPreview",
            title: "Imagem",
            label: hasPreview ? "Com imagem" : "Sem imagem",
        });
    }

    return chips;
};
