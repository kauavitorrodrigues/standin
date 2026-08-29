import { useMutation } from "@tanstack/react-query";
import type { Space, SpaceUpdateSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

type UpdateSpaceInput = SpaceUpdateSchemaType & { id: string };

export const useUpdate = () => {
    const organizationId = useOrganization().organization?.id;

    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: UpdateSpaceInput): Promise<Space> => {
            const res = await api.put(
                `/organizations/${organizationId}/spaces/${id}`,
                data,
            );
            return res.data.space;
        },
    });
};
