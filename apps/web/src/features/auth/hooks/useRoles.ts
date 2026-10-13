import { useMemo } from "react";
import { ROLES, resolveRoles, type Role } from "@standin/auth";
import { useAuth } from "./useAuth";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

// Roles of the signed-in user in the active organization. The admin role
// comes from the user, the owner role from the organization's `ownerId`.
export const useRoles = (): Role[] => {
    const { user } = useAuth();
    const { organization } = useOrganization();
    const ownerId = organization?.ownerId;

    return useMemo(
        () =>
            resolveRoles(
                user,
                ownerId === user.id ? ROLES.OWNER : ROLES.MEMBER
            ),
        [user, ownerId]
    );
};
