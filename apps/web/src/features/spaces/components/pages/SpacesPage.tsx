import { PageContainer } from "@/components/layout/page-container";
import { SpacesList } from "@/features/spaces/components/instances/SpacesList";
import { CreateSpaceDialog } from "@/features/spaces/components/dialogs/CreateDialog";

export function SpacesPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Meus espaços"
                controls={
                    <PageContainer.Controls>
                        <CreateSpaceDialog />
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <SpacesList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
