import { useMutation } from "@tanstack/react-query";
import type { Organization, OrganizationDataSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const useCreate = () => {
    return useMutation({
        mutationFn: async (
            data: OrganizationDataSchemaType,
        ): Promise<Organization> => {
            const res = await api.post("/organizations", data);
            return res.data.organization;
        },
    });
};
