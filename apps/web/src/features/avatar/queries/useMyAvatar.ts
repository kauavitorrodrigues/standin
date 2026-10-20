import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_API_PATHS } from "../consts/editor/paths";
import { MY_AVATAR_QUERY_KEY } from "../consts/editor/queryKeys";
import type { MyAvatar } from "../types/editor";

// The avatar the person has now: the base and the parts they chose, and the
// id of the assembled sheet.
export const myAvatarQueryOptions = () =>
    queryOptions({
        queryKey: [MY_AVATAR_QUERY_KEY],
        queryFn: async (): Promise<MyAvatar> => {
            const res = await api.get(AVATAR_API_PATHS.ME);
            return res.data;
        },
    });

export const useMyAvatar = () => useQuery(myAvatarQueryOptions());
