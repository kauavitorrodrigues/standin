import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const useDelete = () => {
    const organizationId = useOrganization().organization?.id;

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await api.delete(`/organizations/${organizationId}/spaces/${id}`);
        },
    });
};
