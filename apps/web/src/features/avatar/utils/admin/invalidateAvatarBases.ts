import type { QueryClient } from "@tanstack/react-query";
import { AVATAR_BASES_QUERY_KEY } from "../../consts/editor/queryKeys";
import { invalidateOwnAvatar } from "../invalidateAvatarEditor";

// The admin list of bases. The avatar of the admin is read again too, because
// a new default or a new sheet of the base in use changes the assembled sheet.
export const invalidateAvatarBases = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: [AVATAR_BASES_QUERY_KEY] }),
        invalidateOwnAvatar(queryClient),
    ]);
