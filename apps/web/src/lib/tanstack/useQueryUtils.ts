import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export type QueryUtils<T> = {
    getData: () => T | undefined;
    setData: (data: T) => void;
    invalidate: () => void;
    refetch: () => void;
    remove: () => void;
};

export const useQueryUtils = <T>(queryKey: QueryKey): QueryUtils<T> => {
    const queryClient = useQueryClient();
    return {
        getData: () => queryClient.getQueryData<T>(queryKey),
        setData: (data) => queryClient.setQueryData<T>(queryKey, data),
        invalidate: () => queryClient.invalidateQueries({ queryKey }),
        refetch: () => queryClient.refetchQueries({ queryKey }),
        remove: () => queryClient.removeQueries({ queryKey }),
    };
};
