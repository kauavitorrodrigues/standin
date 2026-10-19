import type { QueryClient } from "@tanstack/react-query";
import { AVATAR_CATEGORIES_QUERY_KEY } from "../../consts/editor/queryKeys";
import { invalidateAvatarEditor } from "../invalidateAvatarEditor";

// The admin list of categories and the editor, which shows their name and
// image.
export const invalidateAvatarCategories = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({
            queryKey: [AVATAR_CATEGORIES_QUERY_KEY],
        }),
        invalidateAvatarEditor(queryClient),
    ]);
