import { useMutation } from "@tanstack/react-query";
import type { MapEntity, MapUpdateSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

type UpdateMapInput = MapUpdateSchemaType & { id: string };

export const useUpdate = () => {
    const organizationId = useOrganization().organization?.id;

    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: UpdateMapInput): Promise<MapEntity> => {
            const res = await api.put(
                `/organizations/${organizationId}/maps/${id}`,
                data
            );
            return res.data.map;
        },
    });
};