import type { QueryClient } from "@tanstack/react-query";
import { AVATAR_PARTS_QUERY_KEY } from "../../consts/editor/queryKeys";
import {
    invalidateAvatarEditor,
    invalidateCategoryParts,
} from "../invalidateAvatarEditor";

// Everything that shows the parts: the admin list, the lists by category of
// the editor and the editor itself, whose current parts carry the sheet urls.
export const invalidateAvatarParts = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: [AVATAR_PARTS_QUERY_KEY] }),
        invalidateCategoryParts(queryClient),
        invalidateAvatarEditor(queryClient),
    ]);
