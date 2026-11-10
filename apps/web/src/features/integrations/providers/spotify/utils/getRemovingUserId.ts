import type { RemoveMutation } from "../types/mutation";

/** The person being removed, to lock their button, or null when none is. */
export const getRemovingUserId = ({
    isPending,
    variables,
}: RemoveMutation): string | null => {
    if (!isPending) return null;
    return variables ?? null;
};
