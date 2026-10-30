import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SOUNDBOARD_SEARCH_DEBOUNCE_MS } from "../consts/search";
import type { ClipSearchFormValues } from "../types/clip";

// The search text of the panel and the term it settles on, which both groups
// are fetched with.
export const useSoundboardSearch = () => {
    const searchForm = useForm<ClipSearchFormValues>({
        defaultValues: { search: "" },
    });
    const typed = useWatch({ control: searchForm.control, name: "search" });
    const search = useDebouncedValue(
        typed.trim(),
        SOUNDBOARD_SEARCH_DEBOUNCE_MS
    );

    return { searchForm, search, hasSearch: search !== "" };
};
