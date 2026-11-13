import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { organizationsQueryOptions } from "../queries/organizations";
import { useOrganization } from "./useOrganization";

// The person is no longer a member of an organization (they left, or the owner
// removed them). The list is read again, and when it was the one they were in
// they move to another, or to none, and go home.
export const useDropOrganization = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { organization, setOrganization } = useOrganization();
    const activeId = organization?.id;

    return useCallback(
        async (organizationId: string): Promise<void> => {
            // What was cached for that organization is not theirs any more.
            queryClient.removeQueries({
                predicate: ({ queryKey }) => queryKey.includes(organizationId),
            });
            const organizations = await queryClient.query({
                ...organizationsQueryOptions(),
                staleTime: 0,
            });
            if (organizationId !== activeId) return;

            setOrganization(organizations[0] ?? null);
            navigate({ to: "/home" });
        },
        [queryClient, navigate, activeId, setOrganization]
    );
};
