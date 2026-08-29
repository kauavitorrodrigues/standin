import { useCallback, useState } from "react";
import type { Organization } from "@standin/contracts";
import {
    clearActiveOrganizationId,
    setActiveOrganizationId,
} from "../lib/activeOrganization";
import { OrganizationContext } from "../hooks/useOrganization";

type OrganizationProviderProps = {
    organization: Organization | null;
    children: React.ReactNode;
};

export const OrganizationProvider = ({
    organization: initialOrganization,
    children,
}: OrganizationProviderProps) => {
    const [organization, setOrganizationState] =
        useState<Organization | null>(initialOrganization);

    const setOrganization = useCallback((newOrganization: Organization | null) => {
        if (newOrganization) {
            setActiveOrganizationId(newOrganization.id);
        } else {
            clearActiveOrganizationId();
        }
        setOrganizationState(newOrganization);
    }, []);

    return (
        <OrganizationContext.Provider value={{ organization, setOrganization }}>
            {children}
        </OrganizationContext.Provider>
    );
};
