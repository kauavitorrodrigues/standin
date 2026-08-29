import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";

export const useSignOut = () => {
    return useMutation({
        mutationFn: async () => {
            await api.post("/auth/signout");
        },
    });
};
