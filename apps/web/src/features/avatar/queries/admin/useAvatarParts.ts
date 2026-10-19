import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_PARTS_QUERY_KEY } from "../../consts/editor/queryKeys";
import { AVATAR_PARTS_PATH } from "../../consts/paths";
import type { AvatarPartList } from "../../types/parts";
import { resolvePartListUrls } from "../../utils/resolveAvatarUrls";

// The parts of the library grouped by slot, as the admin page lists them. Each
// item is a family: the base part and, in `variations`, every color of it with
// the base first.
export const useAvatarParts = () => {
    const query = useQuery({
        queryKey: [AVATAR_PARTS_QUERY_KEY, "list"],
        queryFn: async (): Promise<AvatarPartList> => {
            const res = await api.get(AVATAR_PARTS_PATH);
            return res.data;
        },
        select: resolvePartListUrls,
        placeholderData: keepPreviousData,
    });

    const slots = query.data?.slots ?? [];
    const total = slots.reduce((sum, group) => sum + group.parts.length, 0);

    return { ...query, slots, total };
};
