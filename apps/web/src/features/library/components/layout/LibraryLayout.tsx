import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { OrganizationLibraryScope } from "../instances/OrganizationLibraryScope";
import { LibrarySidebar } from "./LibrarySidebar";
import { SectionShell } from "./SectionShell";

export const LibraryLayout = () => {
    const organizationId = useOrganizationId();

    return (
        <OrganizationLibraryScope organizationId={organizationId}>
            <SectionShell title="Biblioteca" sidebar={<LibrarySidebar />} />
        </OrganizationLibraryScope>
    );
};
