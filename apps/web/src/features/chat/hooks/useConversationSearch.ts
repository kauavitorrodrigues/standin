import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { CONVERSATION_SEARCH_DEBOUNCE_MS } from "@/features/chat/consts/search";
import { useSearchHotkey } from "@/features/spaces/hooks/useSearchHotkey";
import { ChatQueries } from "@/features/chat/queries";
import type { ConversationSearchFormValues } from "@/features/chat/types/searchForm";

// The search text of the conversation list, the conversations the server
// found for it, and the Ctrl+F shortcut that focuses the field. The shortcut
// takes over the browser's find only while the list is mounted.
export const useConversationSearch = () => {
    const form = useForm<ConversationSearchFormValues>({
        defaultValues: { search: "" },
    });
    const typed = useWatch({ control: form.control, name: "search" });
    const search = useDebouncedValue(
        typed.trim(),
        CONVERSATION_SEARCH_DEBOUNCE_MS
    );
    const results = ChatQueries.useSearchConversations(search);

    useSearchHotkey(() => form.setFocus("search", { shouldSelect: true }));

    // The results lag the typing by the debounce, so the list shows as
    // loading until the server has answered for the current text.
    const isWaiting = typed.trim() !== search;

    return {
        form,
        isSearching: typed.trim() !== "",
        results: {
            conversations: results.conversations,
            isLoading: isWaiting || results.isLoading,
            isError: results.isError,
        },
    };
};
