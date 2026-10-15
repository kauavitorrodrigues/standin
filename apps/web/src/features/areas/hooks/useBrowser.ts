import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AREA_SEARCH_DEBOUNCE_MS } from "../consts/search";
import { AreasQueries } from "../queries";
import type { AreaSearchFormValues } from "../types/searchForm";

// The state of the areas page: the search text and the areas the server
// returned for it.
export const useAreasBrowser = () => {
    const searchForm = useForm<AreaSearchFormValues>({
        defaultValues: { search: "" },
    });
    const typed = useWatch({ control: searchForm.control, name: "search" });
    const search = useDebouncedValue(typed.trim(), AREA_SEARCH_DEBOUNCE_MS);
    const list = AreasQueries.useAll({ search: search || undefined });

    return { searchForm, list, hasSearch: search !== "" };
};
