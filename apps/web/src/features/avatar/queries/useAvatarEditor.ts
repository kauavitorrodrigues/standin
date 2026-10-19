import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_API_PATHS } from "../consts/editor/paths";
import { AVATAR_EDITOR_QUERY_KEY } from "../consts/editor/queryKeys";
import type { AvatarEditor } from "../types/editor";
import { resolveEditorUrls } from "../utils/resolveAvatarUrls";

// What the editor needs to open: the categories with their image, the blank
// avatars and what the person uses now. It carries no part list, those come
// one category at a time from `useCategoryParts`.
export const avatarEditorQueryOptions = () =>
    queryOptions({
        queryKey: [AVATAR_EDITOR_QUERY_KEY],
        queryFn: async (): Promise<AvatarEditor> => {
            const res = await api.get(AVATAR_API_PATHS.EDITOR);
            return res.data;
        },
        select: resolveEditorUrls,
    });

export const useAvatarEditor = () => useQuery(avatarEditorQueryOptions());
