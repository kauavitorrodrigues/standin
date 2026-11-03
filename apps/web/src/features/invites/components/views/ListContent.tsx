import { InviteMessages } from "../../consts/messages";
import type { ListContentProps } from "../../types/view";
import { ListErrorState } from "./ListErrorState";
import { ListLoadingState } from "./ListLoadingState";

// Loading, error, empty or the table: the states of a list.
export const ListContent = ({
    isLoading,
    isError,
    isEmpty,
    emptyState,
    content,
}: ListContentProps) => {
    if (isLoading) return <ListLoadingState />;
    if (isError) {
        return <ListErrorState message={InviteMessages.managersLoadFailed} />;
    }
    if (isEmpty) return emptyState;
    return content;
};
