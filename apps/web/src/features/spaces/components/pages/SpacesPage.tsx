import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { SpacesList } from "@/features/spaces/components/instances/SpacesList";

export function SpacesPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Meus espaços"
                controls={
                    <PageContainer.Controls>
                        <Button
                            variant="outline"
                            size="lg"
                            render={<Link to="/spaces/new" />}
                        >
                            <PlusIcon />
                            Criar espaço
                        </Button>
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <SpacesList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
