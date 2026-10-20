import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_BASES_QUERY_KEY } from "../../consts/editor/queryKeys";
import { AVATAR_BASES_PATH } from "../../consts/paths";
import type { AvatarBaseList } from "../../types/parts";
import { resolveBaseUrls } from "../../utils/resolveAvatarUrls";

const resolveList = (list: AvatarBaseList): AvatarBaseList => ({
    groups: list.groups.map((group) => ({
        ...group,
        bases: group.bases.map(resolveBaseUrls),
    })),
});

// The blank avatars grouped by kind as the API gives them, the default first
// in each group. Deleted ones are not listed.
export const useAvatarBases = () => {
    const query = useQuery({
        queryKey: [AVATAR_BASES_QUERY_KEY, "list"],
        queryFn: async (): Promise<AvatarBaseList> => {
            const res = await api.get(AVATAR_BASES_PATH);
            return res.data;
        },
        select: resolveList,
    });

    const groups = query.data?.groups ?? [];

    return { ...query, groups };
};
