import { useMutation } from "@tanstack/react-query";
import type { Space, SpaceDataSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const useCreate = () => {
    const organizationId = useOrganization().organization?.id;

    return useMutation({
        mutationFn: async (data: SpaceDataSchemaType): Promise<Space> => {
            const res = await api.post(
                `/organizations/${organizationId}/spaces`,
                data,
            );
            return res.data.space;
        },
    });
};
