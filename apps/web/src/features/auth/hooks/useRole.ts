import { useMemo } from "react";
import { ROLES, resolveRole, type Role } from "@standin/auth";
import { useAuth } from "./useAuth";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

// Role of the signed-in user in the active organization. Admins keep ADMIN
// everywhere, owners are detected through the organization's `ownerId`.
export const useRole = (): Role => {
    const { user } = useAuth();
    const { organization } = useOrganization();

    return useMemo(() => {
        const membershipRole =
            organization?.ownerId === user.id ? ROLES.OWNER : ROLES.MEMBER;
        return resolveRole(user, membershipRole);
    }, [user, organization?.ownerId]);
};
