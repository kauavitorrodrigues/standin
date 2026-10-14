import { useMemo, type ReactNode } from "react";
import { LibraryScopeContext } from "../../contexts/LibraryScopeContext";
import { buildOrganizationLibraryScope } from "../../utils/buildLibraryScope";

type Props = { organizationId: string; children: ReactNode };

export const OrganizationLibraryScope = ({
    organizationId,
    children,
}: Props) => {
    const scope = useMemo(
        () => buildOrganizationLibraryScope(organizationId),
        [organizationId]
    );

    return (
        <LibraryScopeContext.Provider value={scope}>
            {children}
        </LibraryScopeContext.Provider>
    );
};
