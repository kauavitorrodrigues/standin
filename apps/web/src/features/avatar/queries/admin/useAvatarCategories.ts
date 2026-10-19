import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_CATEGORIES_QUERY_KEY } from "../../consts/editor/queryKeys";
import { AVATAR_CATEGORIES_PATH } from "../../consts/paths";
import type { AvatarCategoryList } from "../../types/parts";
import { resolveCategoryUrls } from "../../utils/resolveAvatarUrls";

const resolveList = (list: AvatarCategoryList): AvatarCategoryList => ({
    categories: list.categories.map(resolveCategoryUrls),
});

// The categories of the avatar, in the order of the editor. They are created
// by the migration, the admin only edits them.
export const useAvatarCategories = () => {
    const query = useQuery({
        queryKey: [AVATAR_CATEGORIES_QUERY_KEY, "list"],
        queryFn: async (): Promise<AvatarCategoryList> => {
            const res = await api.get(AVATAR_CATEGORIES_PATH);
            return res.data;
        },
        select: resolveList,
    });

    const categories = query.data?.categories ?? [];

    return { ...query, categories };
};
