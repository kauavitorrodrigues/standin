import {
    LIBRARY_TILESET_PROGRESS,
    type LibraryTilesetProgress,
} from "@standin/contracts";
import type { ActiveFilterChip } from "@/features/assets/types/activeFilterChip";
import type { TilesetFilters } from "../types/filters";

const getProgressLabel = (progress: LibraryTilesetProgress): string => {
    switch (progress) {
        case LIBRARY_TILESET_PROGRESS.COMPLETE:
            return "Completo";
        case LIBRARY_TILESET_PROGRESS.INCOMPLETE:
            return "Incompleto";
    }
};

// One chip per filter in use, in the order of the sidebar.
export const getTilesetFilterChips = ({
    search,
    inUse,
    progress,
}: TilesetFilters): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = [];

    if (search) {
        chips.push({ field: "search", title: "Busca", label: search });
    }
    if (inUse !== undefined) {
        chips.push({
            field: "inUse",
            title: "Uso",
            label: inUse ? "Em uso" : "Livre",
        });
    }
    if (progress) {
        chips.push({
            field: "progress",
            title: "Categorias",
            label: getProgressLabel(progress),
        });
    }

    return chips;
};
