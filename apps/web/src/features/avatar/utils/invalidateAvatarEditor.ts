import type { QueryClient } from "@tanstack/react-query";
import {
    AVATAR_CATEGORY_PARTS_QUERY_KEY,
    AVATAR_EDITOR_QUERY_KEY,
    MY_AVATAR_QUERY_KEY,
} from "../consts/editor/queryKeys";

// What the editor of a person shows: the categories, the blanks and what they
// use now.
export const invalidateAvatarEditor = (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: [AVATAR_EDITOR_QUERY_KEY] });

// The parts of every category that was opened, kept one entry per slot.
export const invalidateCategoryParts = (queryClient: QueryClient) =>
    queryClient.invalidateQueries({
        queryKey: [AVATAR_CATEGORY_PARTS_QUERY_KEY],
    });

// The avatar of the person and everything that is read from it: the sheet id
// the profile bubble draws and the editor that opens with it.
export const invalidateOwnAvatar = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: [MY_AVATAR_QUERY_KEY] }),
        invalidateAvatarEditor(queryClient),
    ]);
