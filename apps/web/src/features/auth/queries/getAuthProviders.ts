import { queryOptions, useQuery } from "@tanstack/react-query";
import type { AuthProviders } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const authProvidersQueryOptions = () =>
    queryOptions({
        queryKey: ["auth", "providers"] as const,
        queryFn: async (): Promise<AuthProviders> => {
            const { data } = await api.get<AuthProviders>("/auth/providers");
            return data;
        },
        // The instance turns a provider on or off with its environment, so the
        // answer only changes with a restart.
        staleTime: Infinity,
        retry: false,
    });

export const useAuthProviders = () => useQuery(authProvidersQueryOptions());
