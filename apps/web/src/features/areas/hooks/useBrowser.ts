import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AREA_SEARCH_DEBOUNCE_MS } from "../consts/search";
import { AreasQueries } from "../queries";
import type { AreaSearchFormValues } from "../types/searchForm";

// The state of the areas page: the search text and the areas the server
// returned for it. The search is offered only when there is something to
// search, or while the user is still searching: with no area and no search,
// the field would have nothing to look through. The placeholder data covers
// the refetch after the text is cleared, so the field does not vanish under
// the user's cursor.
export const useAreasBrowser = () => {
    const searchForm = useForm<AreaSearchFormValues>({
        defaultValues: { search: "" },
    });
    const typed = useWatch({ control: searchForm.control, name: "search" });
    const search = useDebouncedValue(typed.trim(), AREA_SEARCH_DEBOUNCE_MS);
    const list = AreasQueries.useAll({ search: search || undefined });

    const hasSearch = search !== "";
    const showSearch =
        typed.trim() !== "" ||
        hasSearch ||
        list.areas.length > 0 ||
        list.isPlaceholderData;

    return { searchForm, list, hasSearch, showSearch };
};
