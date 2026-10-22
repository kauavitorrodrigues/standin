import { OrganizationsQueries } from "@/features/organizations/queries";
import { GuestSpacesSection } from "@/features/spaces/guests/components/instances/GuestSpacesSection";
import { SpacesPage } from "@/features/spaces/components/pages/SpacesPage";
import {
    OrganizationsEmptyState,
    OrganizationsErrorState,
    OrganizationsLoadingState,
} from "@/features/organizations/components/pages/ContentStates";

function Content() {
    const { organizations, isLoading, isError } = OrganizationsQueries.useAll();

    if (isLoading) return <OrganizationsLoadingState />;

    if (isError) {
        return (
            <div className="flex w-full flex-1 items-center justify-center p-6">
                <OrganizationsErrorState />
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <div className="flex w-full flex-1 items-center justify-center p-6">
                <OrganizationsEmptyState />
            </div>
        );
    }

    return <SpacesPage />;
}

export function OrganizationsPage() {
    return (
        <div className="flex w-full flex-1 flex-col bg-background">
            <GuestSpacesSection />
            <Content />
        </div>
    );
}
