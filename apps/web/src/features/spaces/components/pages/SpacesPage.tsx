import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { useGlobalCapabilities } from "@/features/global-settings/queries/useGlobalCapabilities";
import { SpacesList } from "@/features/spaces/components/instances/SpacesList";

export function SpacesPage() {
    const { canCreateSpace } = useGlobalCapabilities();

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Meus espaços"
                description="Entre em um espaço ou crie um novo para a sua equipe."
                className="border-b-0"
                controls={
                    canCreateSpace && (
                        <PageContainer.Controls>
                            <Button
                                size="lg"
                                render={<Link to="/spaces/new" />}
                            >
                                <PlusIcon />
                                Novo espaço
                            </Button>
                        </PageContainer.Controls>
                    )
                }
            />
            <PageContainer.Content>
                <SpacesList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
