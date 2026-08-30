import { useMutation } from "@tanstack/react-query";
import type { MapDataSchemaType, MapEntity } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { buildMapFormData } from "../utils/buildMapFormData";

type CreateMapInput = {
    data: MapDataSchemaType;
    mapJsonFile: File;
    tilesetImages: File[];
};

export const useCreate = () => {
    const organizationId = useOrganization().organization?.id;

    return useMutation({
        mutationFn: async ({
            data,
            mapJsonFile,
            tilesetImages,
        }: CreateMapInput): Promise<MapEntity> => {
            const formData = buildMapFormData(data, mapJsonFile, tilesetImages);

            const res = await api.post(
                `/organizations/${organizationId}/maps`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return res.data.map;
        },
    });
};
