import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { TILESET_SEARCH_DEBOUNCE_MS } from "../consts/search";
import { useLibraryTilesets } from "../queries/useList";
import type { TilesetFilters } from "../types/filters";
import type { TilesetSearchFormValues } from "../types/searchForm";
import { getTilesetFilterChips } from "../utils/getFilterChips";

// The state of the tilesets page: the search text, the filters of the sidebar
// and the tilesets they narrow down.
export const useTilesetsBrowser = () => {
    const searchForm = useForm<TilesetSearchFormValues>({
        defaultValues: { search: "" },
    });
    const typed = useWatch({ control: searchForm.control, name: "search" });
    const search = useDebouncedValue(typed.trim(), TILESET_SEARCH_DEBOUNCE_MS);

    const [chosen, setChosen] = useState<TilesetFilters>({});
    const filters: TilesetFilters = {
        ...chosen,
        search: search || undefined,
    };
    const list = useLibraryTilesets(filters);

    const changeFilters = (changes: TilesetFilters) => {
        if ("search" in changes) searchForm.setValue("search", "");
        setChosen((current) => ({ ...current, ...changes }));
    };

    return {
        searchForm,
        filters,
        changeFilters,
        chips: getTilesetFilterChips(filters),
        list,
        hasFilters: Object.values(filters).some((value) => value !== undefined),
    };
};
