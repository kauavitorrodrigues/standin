import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";

// A member leaves the organization. The owner cannot: the server answers 409.
export const useLeave = (organizationId: string) =>
    useMutation({
        mutationFn: async (): Promise<void> => {
            await api.post(`/organizations/${organizationId}/leave`);
        },
    });
