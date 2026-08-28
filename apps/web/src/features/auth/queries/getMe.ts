import { queryOptions } from "@tanstack/react-query";
import type { User } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const getMeQueryOptions = () =>
    queryOptions({
        queryKey: ["auth", "me"] as const,
        queryFn: async () => {
            const { data } = await api.get<{ user: User }>("/auth/validate");
            return data.user;
        },
        retry: false,
    });
