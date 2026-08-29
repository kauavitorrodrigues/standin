import { createContext, useContext } from "react";
import type { Organization } from "@standin/contracts";

export type OrganizationContextType = {
    organization: Organization | null;
    setOrganization: (organization: Organization | null) => void;
};

export const OrganizationContext =
    createContext<OrganizationContextType | null>(null);

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error(
            "useOrganization must be used within a OrganizationProvider",
        );
    }
    return context;
};
