import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Space } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import type { SetThumbnailInput } from "../types/setThumbnailInput";
import { buildThumbnailFormData } from "../utils/buildThumbnailFormData";
import { applySpaceThumbnail } from "../utils/applySpaceThumbnail";

export const useSetThumbnail = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganizationId();

    return useMutation({
        mutationFn: async ({
            spaceId,
            thumbnail,
        }: SetThumbnailInput): Promise<Space> => {
            const res = await api.put(
                `/organizations/${organizationId}/spaces/${spaceId}/thumbnail`,
                buildThumbnailFormData(thumbnail),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.space;
        },
        onSuccess: (space) =>
            applySpaceThumbnail(queryClient, organizationId, space),
    });
};
